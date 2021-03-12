import { Entity } from '@mikro-orm/core/decorators/Entity';
import { Unique } from '@mikro-orm/core/decorators/Indexed';
import { ManyToOne } from '@mikro-orm/core/decorators/ManyToOne';
import { OneToMany } from '@mikro-orm/core/decorators/OneToMany';
import { PrimaryKey } from '@mikro-orm/core/decorators/PrimaryKey';
import { Property } from '@mikro-orm/core/decorators/Property';
import { Collection } from '@mikro-orm/core/entity/Collection';
import { Cascade } from '@mikro-orm/core/enums';

@Entity()
@Unique({ properties: ['userId', 'targetId'] })
class ACGroupRight {
  @PrimaryKey({ nullable: true })
  _id?: string;

  @Property()
  target!: string;

  @Property()
  targetId!: unknown;

  @Property()
  userId!: unknown;

  @Property()
  role!: string;

  @Property()
  parentId?: unknown;
}

export default ACGroupRight;
