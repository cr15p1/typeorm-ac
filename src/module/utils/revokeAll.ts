import { getAcRepository } from '../metadata';
import { RejectAllOptions } from '../types';

const revokeAll = async ({
  targetId,
}: RejectAllOptions): Promise<void> => {
  const acRepository = await getAcRepository();
  const right = await acRepository.findOne({ targetId });
  if (!right) return;
  await acRepository.removeAndFlush(right);
  const children = await acRepository.find({
    parentId: targetId,
  });
  await Promise.all(
    children.map((child) => revokeAll({ targetId: child.targetId })),
  );
};
export default revokeAll;
