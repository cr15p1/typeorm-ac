import { EntityRepository, MikroORM } from '@mikro-orm/core';
import ACGroupRight from './entities/ACGroupRight';
import { Metadata, Parent } from './types';

const md: Metadata = {
  targets: {},
};

export const getMetadata = (): Metadata => md;

export const setOrm = (orm: MikroORM): void => {
  md.orm = orm;
};

export const addTarget = (
  target: new () => unknown,
  childOf?: Parent,
): void => {
  md.targets[target.name] = { class: target, childOf };
};

export const mapTarget = async (
  target: new () => unknown,
  targetId: unknown,
  parent: unknown,
  cb: (ac: ACGroupRight) => void,
) => {
  const acRepository = await getAcRepository();
  console.log(target, targetId, parent, cb);
};

export const getORM = (): Promise<MikroORM> =>
  new Promise((resolve) => {
    (function f() {
      const orm = getMetadata()?.orm;
      if (orm) {
        resolve(orm);
      } else {
        setTimeout(f, 200);
      }
    })();
  });

export const getAcRepository = async (): Promise<
  EntityRepository<ACGroupRight>
> => {
  return (await getORM()).em.fork().getRepository(ACGroupRight);
};
