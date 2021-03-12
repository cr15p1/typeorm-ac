import { EntityManager } from '@mikro-orm/core/EntityManager';
import { MikroORM } from '@mikro-orm/core/MikroORM';

export interface DatabaseImp {
  getObjectRelationalMapping: () => MikroORM;
  getEntityManager: () => MikroORM['em'];
  getRepository: EntityManager['getRepository'];
}
