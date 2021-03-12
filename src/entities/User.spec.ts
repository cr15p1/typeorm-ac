import User from './User.entity';

describe('user', () => {
  beforeEach(async () => {
    const user = User.create({ firstName: 'foo' });
    await User.save(user);
  });
});
