import { EntityRepository } from '@mikro-orm/core/entity/EntityRepository';
import { ObjectId, ObjectID } from 'mongodb';
import {
  Arg,
  Field,
  ID,
  InputType,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';
import Post from '../entities/Post.entity';
import grantedIds from '../module/utils/grantedIds';
import Repo from '../Repo';

@InputType()
class PostInput implements Partial<Post> {
  @Field()
  content!: string;

  @Field(() => ID)
  userId!: ObjectID;
}

@Resolver()
class PostResolver {
  @Repo(Post)
  private postRepository!: EntityRepository<Post>;

  @Query(() => Post)
  async post(@Arg('_id') _id: string): Promise<Post> {
    const post = await this.postRepository.findOne(_id);
    if (!post) throw new Error('cannot find post with id ' + _id);
    return post;
  }

  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    const ids = await grantedIds<ObjectId>(Post);
    return await this.postRepository.find({ _id: { $in: ids } }, {});
  }

  @Mutation(() => Post)
  async addPost(
    @Arg('record') { userId, ...post }: PostInput,
  ): Promise<Post> {
    const createdPost = this.postRepository.create({
      ...post,
      user: userId,
    });
    await this.postRepository.persistAndFlush(createdPost);
    return createdPost;
  }

  @Mutation(() => Post)
  async removePost(@Arg('id') id: string): Promise<Post> {
    const post = await this.postRepository.findOne(id);
    if (!post) {
      throw new Error('cannot find post with id ' + id);
    }
    await this.postRepository.removeAndFlush(post);
    return post;
  }
}

export default PostResolver;
