/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { MikroORM } from '@mikro-orm/core/MikroORM';

const database = async (): Promise<MikroORM> => {
  const orm = await MikroORM.init({
    entities: [
      'dist/entities/*.entity.ts',
      'src/entities/*.entity.ts',
    ],
    dbName: 'my-db-name',
    type: 'mongo',
    clientUrl: 'mongodb://localhost:27017',
    ensureIndexes: true,
  });
  return orm;
};

export default database;
