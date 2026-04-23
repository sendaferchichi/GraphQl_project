import { createYoga, createSchema, createPubSub } from 'graphql-yoga';
import { createServer } from 'http';
import { resolvers } from './resolvers/index.js';
import { prisma } from './prisma.js';
import fs from 'fs';
import path from 'path';

const pubSub = createPubSub();

const schemaFilePath = path.join(process.cwd(), 'src', 'schema', 'schema.graphql');
const typeDefs = fs.readFileSync(schemaFilePath, 'utf-8');

const schema = createSchema({
  typeDefs,
  resolvers,
});

const yoga = createYoga({
  schema,
  context: {
    prisma,
    pubSub
  },
});

const server = createServer(yoga);

server.listen(8000, () => {
  console.info('Server is running on http://localhost:8000/graphql');
});
