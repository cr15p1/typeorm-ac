import type { MikroORM } from '@mikro-orm/core/MikroORM';
import { Access } from 'accesscontrol/lib/core/Access';

export interface MiddlewareOptions {
  userIdPath: string;
}

export interface Target {
  class: new () => unknown;
  childOf?: Parent;
}

export interface Metadata {
  orm?: MikroORM;
  targets: { [key: string]: Target };
}

export interface ScopedStorage {
  req: Request;
  res: Response;
  userId: string;
}

export interface GrantOptions {
  role: string;
  target: string;
  userId: unknown;
  targetId: unknown;
  parentId: unknown;
}

export interface RejectOptions {
  targetId: unknown;
  userId: unknown;
}

export interface RejectAllOptions {
  targetId: unknown;
}

export interface Parent {
  primaryKey?: string;
  type: () => new () => unknown;
  mappedBy: string;
}

export interface ACGroupOptions {
  childOf?: Parent;
  primaryKey?: 'id' | '_id' | 'uuid' | string;
  access: Access;
}
