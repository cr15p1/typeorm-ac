import { getAcRepository } from '../metadata';
import { getScopedStorage } from '../middleware';

const grantedIds = async <T>(
  target: new () => unknown,
): Promise<T[]> => {
  const acRepository = await getAcRepository();

  const targets = await acRepository.find(
    { target: target.name, userId: getScopedStorage().userId },
    { fields: ['targetId'] },
  );

  return targets.map((target) => target.targetId as T);
};

export default grantedIds;
