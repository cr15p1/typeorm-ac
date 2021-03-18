import { MetadataStorage } from '@mikro-orm/core/metadata/MetadataStorage';
import { AnyEntity } from '@mikro-orm/core/typings';
import { addTarget } from '../metadata';
import { getScopedStorage } from '../middleware';
import { ACGroupOptions } from '../types';
import grant from '../utils/grant';
import userRole from '../utils/userRole';
import revokeAll from '../utils/revokeAll';
import validateAuthorization from '../utils/validateAuthorization';
import { AccessControl, Query } from 'accesscontrol';

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

type Check =
  | 'createOwn'
  | 'createAny'
  | 'readOwn'
  | 'readAny'
  | 'updateOwn'
  | 'updateAny'
  | 'deleteOwn'
  | 'deleteAny';

const checkRole = (
  access: AccessControl,
  checks: Check[],
  roles: string[],
  targetName?: string,
) => {
  return roles
    .map((role) => {
      return role && targetName
        ? checks
            .map((check) => {
              try {
                return access.can(role)[check](targetName).granted;
              } catch (e) {
                return false;
              }
            })
            .find((check) => check)
        : false;
    })
    .find((has) => has);
};

const getTargetUserRight = (name: string, targetId: unknown) =>
  getScopedStorage().userRights?.find(
    (right) =>
      right.target === name &&
      String(right.targetId) === String(targetId),
  );

const makeRoles = (...roles: (string | undefined | void | '')[]) =>
  roles.filter(
    (role) => typeof role === 'string' && role,
  ) as string[];

interface CheckPermissionOptions {
  targetId: unknown;
  targetName: string;
  access: AccessControl;
  checks: Check[];
}

const checkPermission = ({
  targetId,
  targetName,
  access,
  checks,
}: CheckPermissionOptions) => {
  const { userId, userRole } = getScopedStorage();

  if (!targetId) {
    return;
  }

  const right = getTargetUserRight(targetName, targetId);

  if (!right?.role && !userRole) {
    throw new Error(
      `user ${userId} has no role for entity ${targetId}`,
    );
  }

  const validRoles: string[] = makeRoles(right?.role, userRole);

  return checkRole(access, checks, validRoles, targetName);
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
    const beforeCreateKey = 'acGroupBeforeCreateMethod';
    const beforeUpdateKey = 'acGroupBeforeUpdateMethod';
    const beforeDeleteKey = 'acGroupBeforeDeleteMethod';

    const targetName = target.name;

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
          const targetId = findId(this, primaryKey);
          const can = checkPermission({
            targetId,
            targetName,
            access,
            checks: ['readOwn', 'readAny'],
          });
          if (!can) {
            throw new Error(
              `user hast no read access to the entity ${targetName} with the id ${targetId}`,
            );
          }
        };
      },
    });

    Reflect.defineProperty(target.prototype, beforeUpdateKey, {
      get: () => {
        return async function (this: AnyEntity) {
          const targetId = findId(this, primaryKey);
          const can = checkPermission({
            targetId,
            targetName,
            access,
            checks: ['updateOwn', 'updateAny'],
          });
          if (!can) {
            throw new Error(
              `user hast no update access to the entity ${targetName} with the id ${targetId}`,
            );
          }
        };
      },
    });

    Reflect.defineProperty(target.prototype, beforeDeleteKey, {
      get: () => {
        return async function (this: AnyEntity) {
          const targetId = findId(this, primaryKey);
          const canDelete = checkPermission({
            targetId,
            targetName,
            access,
            checks: ['deleteOwn', 'deleteAny'],
          });

          if (!canDelete) {
            throw new Error(
              `user has no delete access to the entity ${target.name} with id ${targetId}`,
            );
          }
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
            role: 'EntityOwner',
            target: target.name,
            userId: await getScopedStorage().userId,
            targetId: findId(this, primaryKey),
            parentId,
          });
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
