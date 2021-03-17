import { MetadataStorage } from '@mikro-orm/core/metadata/MetadataStorage';
import { AnyEntity } from '@mikro-orm/core/typings';
import { addTarget } from '../metadata';
import { getScopedStorage } from '../middleware';
import { ACGroupOptions } from '../types';
import grant from '../utils/grant';
import userRole from '../utils/userRole';
import revokeAll from '../utils/revokeAll';
import validateAuthorization from '../utils/validateAuthorization';

const findId = (
  target: Record<string, unknown>,
  primaryKey?: string,
) => {
  return primaryKey
    ? target[primaryKey]
    : Object.entries(target).find((entry) =>
        ['id', 'uuid', '_id'].includes(entry[0]),
      )?.[1];
};

const getParentId = (
  instance: Record<string, Record<string, unknown>>,
  parentTarget?: new () => unknown,
  parentPrimaryKey?: string,
) => {
  const parent =
    parentTarget &&
    Object.values(instance).find(
      (value) => value instanceof parentTarget,
    );
  return parent && findId(parent, parentPrimaryKey);
};

export const ACGroup = ({
  access,
  primaryKey,
  childOf,
}: ACGroupOptions) => {
  return <T extends new () => unknown>(target: T): T => {
    const afterCreateKey = 'acGroupAfterCreateMethod';
    const afterDeleteKey = 'acGroupAfterDeleteMethod';
    const onInitKey = 'acGroupOnInitMethod';
    const beforeCreateKey = 'acGroupBeforeDeleteMethod';
    const beforeUpdateKey = 'acGroupBeforeUpdateMethod';
    const beforeDeleteKey = 'acGroupBeforeDeleteMethod';

    Reflect.defineProperty(target.prototype, beforeCreateKey, {
      get: () => {
        return async function (this: AnyEntity) {
          if (childOf) {
            const parentTarget = childOf.type();
            const parentId = getParentId(
              this,
              parentTarget,
              childOf?.primaryKey,
            );
            await validateAuthorization.create(
              parentTarget,
              parentId,
            );
          }
        };
      },
    });

    Reflect.defineProperty(target.prototype, onInitKey, {
      get: function () {
        return function (this: AnyEntity) {
          const { userId, userRights, userRole } = getScopedStorage();
          const targetId = findId(this, primaryKey);

          console.log(userRights, target.name, targetId);

          const right = userRights?.find(
            (right) =>
              right.target === target.name &&
              String(right.targetId) === String(targetId),
          );

          if (!right?.role && !userRole) {
            throw new Error(
              `user ${userId} has no role for entity ${targetId}`,
            );
          }

          let canReadAny: boolean | void | undefined | '';
          try {
            canReadAny =
              right &&
              access.can(right.role).readAny(target.name).granted;
          } catch (e) {
            console.log(e);
          }

          let canReadOwn: boolean | void | undefined | '';
          try {
            canReadOwn =
              right &&
              access.can(right.role).readOwn(target.name).granted;
          } catch (e) {
            console.log(e);
          }

          console.log(
            'canReadOwn:',
            canReadOwn,
            'canReadAny:',
            canReadAny,
          );
          if (!canReadOwn && !canReadAny) {
            throw new Error(
              `user ${userId} has no read access to the entity ${target.name} with id ${targetId}`,
            );
          }
        };
      },
    });

    Reflect.defineProperty(target.prototype, afterDeleteKey, {
      get: () => {
        return async function (this: AnyEntity) {
          await revokeAll({
            targetId: findId(this, primaryKey),
          });
        };
      },
    });

    Reflect.defineProperty(target.prototype, afterCreateKey, {
      get: () =>
        async function (this: AnyEntity) {
          const parentId = getParentId(
            this,
            childOf?.type(),
            childOf?.primaryKey,
          );

          await grant({
            role: 'Owner',
            target: target.name,
            userId: await getScopedStorage().userId,
            targetId: findId(this, primaryKey),
            parentId,
          });
        },
    });

    const { hooks } = MetadataStorage.getMetadataFromDecorator(
      target,
    );

    hooks.beforeCreate = hooks.beforeCreate || ([] as []);
    hooks.beforeCreate.push((beforeCreateKey as unknown) as never);

    hooks.onInit = hooks.onInit || ([] as []);
    hooks.onInit.push((onInitKey as unknown) as never);

    hooks.beforeUpdate = hooks.beforeUpdate || [];
    hooks.beforeUpdate.push((beforeUpdateKey as unknown) as never);

    hooks.beforeDelete = hooks.beforeDelete || [];
    hooks.beforeDelete.push((beforeDeleteKey as unknown) as never);

    hooks.afterDelete = hooks.afterDelete || [];
    hooks.afterDelete.push((afterDeleteKey as unknown) as never);

    hooks.afterCreate = hooks.afterCreate || [];
    hooks.afterCreate.push((afterCreateKey as unknown) as never);

    return target;
  };
};

export default ACGroup;
