import { getAcRepository } from '../metadata';
import { RejectOptions } from '../types';

const revoke = async ({
  targetId,
  userId,
}: RejectOptions): Promise<void> => {
  const acRepository = await getAcRepository();
  const right = await acRepository.findOne({ targetId, userId });
  if (!right) return;
  await acRepository.removeAndFlush(right);
  const children = await acRepository.find({
    parentId: targetId,
    userId,
  });
  await Promise.all(
    children.map((child) =>
      revoke({ targetId: child.targetId, userId }),
    ),
  );
};
export default revoke;
