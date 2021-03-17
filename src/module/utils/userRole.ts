import { getAcRepository } from '../metadata';
import { getScopedStorage } from '../middleware';

const userRole = async (
  target: new () => unknown,
  targetId: unknown,
): Promise<string | undefined> => {
  console.log('test');
  const { userId } = getScopedStorage();
  console.log('userId');
  const acRepository = await getAcRepository();
  console.log('repo');
  const role = (
    await acRepository.findOne(
      {
        target: target.name,
        targetId,
        userId,
      },
      { role: true },
    )
  )?.role;
  return role;
};

export default userRole;
