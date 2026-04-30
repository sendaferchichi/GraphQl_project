import { IncomingMessage, ServerResponse } from 'http';
import { appEventEmitter, type CvEventPayload } from '../events/index.js';
import { users, UserRole } from '../db.js';

/**
 * SSE Handler for real-time CV event notifications.
 * 
 * Endpoint: GET /sse/cv-events?userId=<id>
 * 
 * - ADMIN users receive ALL CV events
 * - Regular USERs only receive events for CVs they own (performedBy === userId)
 */
export function handleSseRequest(req: IncomingMessage, res: ServerResponse): void {
  // Parse userId from query string
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing required query parameter: userId' }));
    return;
  }

  // Verify user exists and get their role
  const user = users.find((u) => u.id === userId);
  if (!user) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `User with id ${userId} not found` }));
    return;
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Send initial connection event
  const connectData = {
    message: `Connected as ${user.name} (${user.role})`,
    userId: user.id,
    role: user.role,
  };
  res.write(`event: connected\ndata: ${JSON.stringify(connectData)}\n\n`);

  console.log(`[SSE] Client connected: ${user.name} (${user.role}) - userId: ${userId}`);

  // Event listener with role-based filtering
  const onCvEvent = (payload: CvEventPayload) => {
    // ADMIN sees everything, USER sees only their own CVs
    if (user.role === UserRole.ADMIN || payload.performedBy === userId) {
      const eventData = {
        type: payload.type,
        cvId: payload.cvId,
        cvName: payload.cvName,
        performedBy: payload.performedBy,
        timestamp: payload.timestamp.toISOString(),
        details: payload.details,
      };

      res.write(`event: cv-event\ndata: ${JSON.stringify(eventData)}\n\n`);

      console.log(`[SSE] Event sent to ${user.name}: ${payload.type} on CV "${payload.cvName}"`);
    }
  };

  // Subscribe to CV events
  appEventEmitter.onCvEvent(onCvEvent);

  // Send heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 30000);

  // Cleanup on client disconnect
  req.on('close', () => {
    appEventEmitter.removeListener('cv:event', onCvEvent);
    clearInterval(heartbeat);
    console.log(`[SSE] Client disconnected: ${user.name} (${user.role})`);
  });
}
