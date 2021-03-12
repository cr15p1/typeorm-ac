import { AnyEntity, EntityName, MikroORM } from '@mikro-orm/core';

let _orm: MikroORM;
const originalInit = MikroORM.init;
MikroORM.init = async function (options, connect) {
  return originalInit(options, connect).then((orm) => {
    _orm = orm;
    return orm;
  });
};

const Repo = (entity: EntityName<AnyEntity>): PropertyDecorator => (
  target,
  propertyKey,
): void => {
  Reflect.defineProperty(target, propertyKey, {
    get: function () {
      return _orm.em.fork().getRepository(entity);
    },
  });
};

export default Repo;
