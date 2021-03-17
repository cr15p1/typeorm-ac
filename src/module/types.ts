import type { MikroORM } from '@mikro-orm/core/MikroORM';
import { AccessControl } from 'accesscontrol/lib/AccessControl';
import { Request, Response } from 'express';

export interface MiddlewareOptions {
  userIdPath: string;
  userRolePath: string;
  owner: string;
}

export interface Target {
  class: new () => unknown;
  childOf?: Parent;
}

export interface Metadata {
  orm?: MikroORM;
  targets: { [key: string]: Target };
}

export interface RBAC {
  roles: string[];
  path: string;
}

export interface UserRight {
  _id: string;
  target: string;
  targetId: unknown;
  userId: unknown;
  role: string;
  parentId?: unknown;
}

export interface ScopedStorage {
  req: Request;
  res: Response;
  owner: string;

  userRights?: UserRight[];
  userId?: string | void;
  rbac?: RBAC;
  userRole?: string | void;
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
  access: AccessControl;
}
