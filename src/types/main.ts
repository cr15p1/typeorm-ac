import { EntityManager } from '@mikro-orm/core/EntityManager';
import { MikroORM } from '@mikro-orm/core/MikroORM';

export const InjectionKeys = {
  DATABASE: Symbol(),
};

export interface Database {
  getObjectRelationalMapping: () => MikroORM;
  getEntityManager: () => MikroORM['em'];
  getRepository: EntityManager['getRepository'];
}

export enum Injections {
  DATABASE = 'DATABASE',
}
