import type { RequestHandler } from 'express';
import { MiddlewareNotProvided } from '../decorators/error';
import { executionAsyncResource, createHook } from 'async_hooks';
import { nanoid } from 'nanoid';
import { MikroORM } from '@mikro-orm/core/MikroORM';
import { getAcRepository, setOrm } from './metadata';
import { Configuration, Options } from '@mikro-orm/core';
import { MiddlewareOptions, ScopedStorage } from './types';
import { IDatabaseDriver } from '@mikro-orm/core/drivers/IDatabaseDriver';

const originalInit = MikroORM.init;
export async function init<
  D extends IDatabaseDriver = IDatabaseDriver
>(
  options: Options<D> | Configuration<D> = {},
  connect?: boolean,
): Promise<MikroORM<D>> {
  if (options instanceof Configuration) {
    throw new Error(
      'MikroORM Configuration class is currently not supported to initiate the connection, please use the Options object',
    );
  }

  const entities = options.entities || [];
  const entitiesTs = options.entitiesTs || [];
  options.entities = [...entities, __dirname + '/entities/*.js'];
  options.entitiesTs = [...entitiesTs, __dirname + '/entities/*.ts'];

  const ormPromise = originalInit(options, connect);
  ormPromise
    .then((orm) => {
      setOrm(orm);
      return orm;
    })
    .catch(console.error);
  return ormPromise;
}

MikroORM.init = init;

const sym = Symbol(nanoid());

createHook({
  init(_, __, ___, resource: any) {
    const cr = executionAsyncResource() as any;
    if (cr) {
      resource[sym] = cr[sym];
    }
  },
}).enable();

const getValueByPath = (a: any, path: string) =>
  path.split('.').reduce((prev, curr) => (prev as any)[curr], a);

export const getScopedStorage = (): ScopedStorage => {
  const asyncResource = (executionAsyncResource() as any)[sym];
  if (asyncResource === undefined) throw new MiddlewareNotProvided();
  return asyncResource;
};

export const middleware: (
  options: MiddlewareOptions,
) => RequestHandler = ({
  userIdPath,
  userRolePath,
  entityOwner,
}) => async (req, res, next) => {
  const acRepository = await getAcRepository();
  const storage: ScopedStorage = {
    req,
    res,
    entityOwner,
  };
  storage.userId = getValueByPath(storage, userIdPath);
  storage.userRole = getValueByPath(storage, userRolePath);
  storage.userRights = await acRepository.find({
    userId: storage.userId,
  });
  (executionAsyncResource() as any)[sym] = storage;
  next();
};

export default middleware;
