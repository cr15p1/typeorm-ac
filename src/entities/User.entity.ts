import { Field, ID, ObjectType } from 'type-graphql';
import Post from './Post.entity';
import { ObjectID } from 'mongodb';
import { OneToMany } from '@mikro-orm/core/decorators/OneToMany';
import { Entity } from '@mikro-orm/core/decorators/Entity';
import { PrimaryKey } from '@mikro-orm/core/decorators/PrimaryKey';
import { Property } from '@mikro-orm/core/decorators/Property';
import ACGroup from '../module/decorators/ACGroup';
import { AccessControl } from 'accesscontrol';

const access = new AccessControl();

access
  .grant('User')
  .createOwn('User')
  .readAny('User')
  .grant('Owner')
  .extend('User')
  .updateOwn('User')
  .deleteOwn('User');

@Entity()
@ObjectType()
@ACGroup({ access })
class User {
  @Field(() => ID)
  @PrimaryKey()
  _id!: ObjectID;

  @Field()
  @Property()
  firstName!: string;

  @OneToMany(() => Post, (post) => post.user, { orphanRemoval: true })
  posts!: Post[];
}

export default User;
