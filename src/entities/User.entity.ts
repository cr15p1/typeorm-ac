import { Field, ID, ObjectType } from 'type-graphql';
import Post from './Post.entity';
import { ObjectID } from 'mongodb';
import { OneToMany } from '@mikro-orm/core/decorators/OneToMany';
import { Entity } from '@mikro-orm/core/decorators/Entity';
import { PrimaryKey } from '@mikro-orm/core/decorators/PrimaryKey';
import { Property } from '@mikro-orm/core/decorators/Property';
import ACGroup from '../module/decorators/ACGroup';
import { AccessControl } from 'accesscontrol';

const ac = new AccessControl();

const access = ac
  .grant('User') // define new or modify existing role. also takes an array.
  .deleteOwn('User')
  .grant('Admin') // switch to another role without breaking the chain
  .extend('User') // inherit role capabilities. also takes an array
  .updateAny('User') // explicitly defined attributes
  .deleteAny('User');

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

  @OneToMany(() => Post, (post) => post.user)
  posts!: Post[];
}

export default User;
