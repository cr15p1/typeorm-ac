import { Entity } from '@mikro-orm/core/decorators/Entity';
import { Unique } from '@mikro-orm/core/decorators/Indexed';
import { ManyToOne } from '@mikro-orm/core/decorators/ManyToOne';
import { OneToMany } from '@mikro-orm/core/decorators/OneToMany';
import { PrimaryKey } from '@mikro-orm/core/decorators/PrimaryKey';
import { Property } from '@mikro-orm/core/decorators/Property';

import { UserRight } from '../types';

@Entity()
@Unique({ properties: ['userId', 'targetId'] })
class ACGroupRight implements UserRight {
  @PrimaryKey({ nullable: true })
  _id!: string;

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
