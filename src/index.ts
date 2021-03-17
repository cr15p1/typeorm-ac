import 'reflect-metadata';
import { middleware } from './module/middleware';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import User from './resolvers/user';
import Post from './resolvers/post';
import express from 'express';
import database from './database';
import { RequestContext } from '@mikro-orm/core/utils/RequestContext';
const app = express();

(async () => {
  const orm = await database();

  const schema = await buildSchema({
    resolvers: [User, Post],
  });

  app.use((req, res, next) => {
    RequestContext.create(orm.em, next);
  });

  app.use((req, res, next) => {
    (req as any).user = {
      id: '604b0eb25eaeae49f3bfe704',
      role: 'Reviewer',
    };
    next();
  });

  app.use(
    middleware({
      userIdPath: 'req.user.id',
      userRolePath: 'req.user.role',
      owner: 'Owner',
    }),
  );

  const server = new ApolloServer({
    schema,
    context: () => {
      return { req: { user: 'ich' } };
    },
  });
  server.applyMiddleware({ app });
  app.listen(3000, () => {
    console.log('🚀 Server ready');
  });
})().catch(console.error);
