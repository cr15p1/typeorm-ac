import ACGroupRight from '../entities/ACGroupRight';
import { getAcRepository } from '../metadata';
import { GrantOptions } from '../types';

const grant = async ({
  target,
  targetId,
  userId,
  role,
  parentId,
}: GrantOptions): Promise<ACGroupRight> => {
  const acRepository = await getAcRepository();
  const ac = acRepository.create({
    target: target,
    targetId,
    userId,
    role,
    parentId,
  });
  await acRepository.persistAndFlush(ac);
  return ac;
};

export default grant;
