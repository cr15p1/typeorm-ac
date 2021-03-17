import { getAcRepository } from '../metadata';
import { getScopedStorage } from '../middleware';
const create = async (
  parentTarget: new () => unknown,
  parentId: unknown,
): Promise<void> => {
  const acRepository = await getAcRepository();
  const storage = getScopedStorage();
  const find = {
    target: parentTarget.name,
    targetId: parentId,
    userId: storage.userId,
  };
  throw new Error('no access');
};

const validateAuthorization = { create };

export default validateAuthorization;
