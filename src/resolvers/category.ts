import { ObjectId } from '@mikro-orm/mongodb';
import {
  Arg,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';
import Category from '../entities/Category.entity';

@InputType()
class CategoryInput implements Partial<Category> {
  @Field()
  title: string;
}

@Resolver()
class CategoryResolver {
  @Query(() => Category)
  async category(@Arg('_id') id: string): Promise<Category> {
    const author = await categoryRepository.findOne(id);
    return author;
  }

  @Query(() => Category)
  async categories(): Promise<Category[]> {
    return await categoryRepository.find({});
  }

  @Mutation(() => Category)
  async addCategory(
    @Arg('record') category: CategoryInput,
  ): Promise<Category> {
    const createdCategory = categoryRepository.create(category);
    categoryRepository.persistAndFlush(createdCategory);
    return createdCategory;
  }
}

export default CategoryResolver;
