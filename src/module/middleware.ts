import type { RequestHandler } from 'express';
import { MiddlewareNotProvided } from '../decorators/error';
import { executionAsyncResource, createHook } from 'async_hooks';
import { nanoid } from 'nanoid';
import { MikroORM } from '@mikro-orm/core/MikroORM';
import { getAcRepository, setOrm } from './metadata';
import { Configuration } from '@mikro-orm/core';
import { MiddlewareOptions, ScopedStorage } from './types';
import { AccessControl } from 'accesscontrol/lib/AccessControl';

const ac = new AccessControl();

ac.grant('User') // define new or modify existing role. also takes an array.
  .createOwn('User') // equivalent to .createOwn('video', ['*'])
  .deleteOwn('User')
  .grant('Admin') // switch to another role without breaking the chain
  .extend('User') // inherit role capabilities. also takes an array
  .updateAny('User') // explicitly defined attributes
  .deleteAny('User');

const originalInit = MikroORM.init;
MikroORM.init = async function (options = {}, connect) {
  if (options instanceof Configuration) {
    throw new Error(
      'MikroORM Configuration class is currently not supported to initiate the connection, please use the Options object',
    );
  }

  const entities = options.entitiesTs || [];
  const entitiesTs = options.entities || [];
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
};

const sym = Symbol(nanoid());

createHook({
  init(_, __, ___, resource: any) {
    const cr = executionAsyncResource() as any;
    if (cr) {
      resource[sym] = cr[sym];
    }
  },
}).enable();

const getValueByPath = (a: any, path: string) => {
  return path
    .split('.')
    .reduce((prev, curr) => (prev as any)[curr], a);
};

export const getScopedStorage = (): ScopedStorage => {
  const asyncResource = (executionAsyncResource() as any)[sym];
  if (asyncResource === undefined) throw new MiddlewareNotProvided();
  return asyncResource;
};

export const middleware: (
  options: MiddlewareOptions,
) => RequestHandler = ({ userIdPath, userRolePath, owner }) => async (
  req,
  res,
  next,
) => {
  const acRepository = await getAcRepository();
  const storage: ScopedStorage = {
    req,
    res,
    owner: owner,
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
