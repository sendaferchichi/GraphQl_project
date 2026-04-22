import { createYoga, createSchema } from 'graphql-yoga';
import { createServer } from 'http';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import { db } from './db.js';

const schema = createSchema({
  typeDefs,
  resolvers,
});

const yoga = createYoga({
  schema,
  context: {
    db,
  },
});

const server = createServer(yoga);

server.listen(8000, () => {
  console.info('Server is running on http://localhost:8000/graphql');
});
