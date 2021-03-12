import { ObjectId } from '@mikro-orm/mongodb';

export enum MetadataKeys {
  SCOPED_CONTEXT_VALUE = 'SCOPED_CONTEXT_VALUE',
}

export interface EntityRights<T extends Enumerator> {
  id: ObjectId;
  entity: string;
  owner: string;
  roles: { [key: string]: T };
}
