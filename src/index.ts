import { createYoga, createSchema, createPubSub } from 'graphql-yoga';
import { createServer } from 'http';
import { resolvers } from './resolvers/index.js';
import { db } from './db.js';
import { registerCvEventListeners, registerWebhookEventListeners } from './events/index.js';
import { handleSseRequest } from './sse/sseHandler.js';
import { setupWebSocket } from './messaging/socketServer.js';
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
    db,
    pubSub
  },
});

// Create HTTP server with SSE route handling
const server = createServer((req, res) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);

  // Route SSE requests to the SSE handler
  if (url.pathname === '/sse/cv-events' && req.method === 'GET') {
    handleSseRequest(req, res);
    return;
  }

  // Route Collab UI
  if (url.pathname === '/collab' && req.method === 'GET') {
    const filePath = path.join(process.cwd(), 'src', 'messaging', 'client.html');
    const content = fs.readFileSync(filePath, 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
    return;
  }

  // Route API Users (pour le login)
  if (url.pathname === '/api/users' && req.method === 'GET') {
    const nonAdmins = db.users.filter(u => u.role !== 'ADMIN');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(nonAdmins));
    return;
  }

  // All other requests go to GraphQL Yoga
  yoga(req, res);
});

// Register event listeners for CV history tracking and Webhooks
registerCvEventListeners();
registerWebhookEventListeners();

// Setup WebSockets for creative messaging and shared board
setupWebSocket(server);

server.listen(8000, () => {
  console.info('Server is running on http://localhost:8000/graphql');
  console.info('SSE endpoint available at http://localhost:8000/sse/cv-events?userId=<id>');
});
