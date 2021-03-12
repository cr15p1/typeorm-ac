import { Entity } from '@mikro-orm/core/decorators/Entity';
import { OneToMany } from '@mikro-orm/core/decorators/OneToMany';
import { PrimaryKey } from '@mikro-orm/core/decorators/PrimaryKey';
import { Property } from '@mikro-orm/core/decorators/Property';
import { ObjectID } from 'mongodb';
import { Field, ID, ObjectType } from 'type-graphql';

Entity();
@ObjectType()
class Category {
  @Field(() => ID)
  @PrimaryKey()
  _id!: ObjectID;

  @Field()
  @Property()
  title!: string;
}

export default Category;
