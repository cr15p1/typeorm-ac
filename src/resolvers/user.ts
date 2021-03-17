import { EntityRepository } from '@mikro-orm/core/entity/EntityRepository';
import { ObjectId } from '@mikro-orm/mongodb';

import {
  Arg,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';
import User from '../entities/User.entity';
import grantedIds from '../module/utils/grantedIds';
import Repo from '../Repo';

@InputType()
class UserInput implements Partial<User> {
  @Field()
  firstName!: string;
}

@Resolver()
class Useresolver {
  @Repo(User)
  userRepository!: EntityRepository<User>;

  @Query(() => User)
  async user(@Arg('_id') _id: string): Promise<User> {
    const author = await this.userRepository.findOne(_id);
    if (!author)
      throw new Error('cannot find author with the id ' + _id);
    return author;
  }

  @Query(() => [User])
  async users(): Promise<User[]> {
    const ids = await grantedIds<ObjectId>(User);
    return await this.userRepository.find({ _id: { $in: ids } });
  }

  @Mutation(() => User)
  async addUser(@Arg('record') user: UserInput): Promise<User> {
    const createdUser = this.userRepository.create(user);
    await this.userRepository.persistAndFlush(createdUser);
    return createdUser;
  }

  @Mutation(() => User)
  async removeUser(@Arg('id') id: string): Promise<User> {
    const user = await this.userRepository.findOne(id);
    if (!user) throw new Error('connot find user with id ' + id);
    await this.userRepository.removeAndFlush(user);
    return user;
  }
}

export default Useresolver;
