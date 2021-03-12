import { Field, ID, ObjectType } from 'type-graphql';
import User from './User.entity';
import Category from './Category.entity';
import { Entity } from '@mikro-orm/core/decorators/Entity';
import { Property } from '@mikro-orm/core/decorators/Property';
import { ObjectID } from 'mongodb';
import { ManyToOne } from '@mikro-orm/core/decorators/ManyToOne';
import { PrimaryKey } from '@mikro-orm/core/decorators/PrimaryKey';
import { ACGroup } from '../module/decorators';
import { AccessControl } from 'accesscontrol';

const ac = new AccessControl();

const access = ac
  .grant('User')
  .deleteOwn('Post')
  .grant('Admin')
  .extend('User')
  .updateAny('Post')
  .deleteAny('Post');

@Entity()
@ObjectType()
@ACGroup({
  access,
  childOf: { type: () => User, mappedBy: 'user' },
})
class Post {
  @Field(() => ID)
  @PrimaryKey()
  _id!: ObjectID;

  @Field()
  @Property()
  content!: string;

  @ManyToOne(() => User)
  user!: User;
}

export default Post;
