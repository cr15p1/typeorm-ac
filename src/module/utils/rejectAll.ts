import { getAcRepository } from '../metadata';
import { RejectAllOptions } from '../types';

const rejectAll = async ({
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
    children.map((child) => rejectAll({ targetId: child.targetId })),
  );
};
export default rejectAll;
