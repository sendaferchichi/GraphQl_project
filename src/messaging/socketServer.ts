import { WebSocketServer, WebSocket } from 'ws';
import { Server, IncomingMessage } from 'http';
import { users, UserRole } from '../db.js';

interface Client {
  id: string;      // userId de db.ts
  ws: WebSocket;
  username: string;
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });
  const clients: Map<string, Client> = new Map();

  console.log('[WS] WebSocket Server linked to db.ts Users');

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    // Extraire le userId de l'URL : /?userId=2
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');

    // Vérifier si l'utilisateur existe dans db.ts
    const dbUser = users.find(u => u.id === userId);

    if (!dbUser || dbUser.role === UserRole.ADMIN) {
      console.log(`[WS] Connection rejected: User ${userId} is invalid or ADMIN`);
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Accès refusé. Seuls les utilisateurs (non-admins) peuvent accéder au board.' }));
      ws.close();
      return;
    }

    const clientId = dbUser.id;
    const username = dbUser.name;
    const newClient: Client = { id: clientId, ws, username };
    
    // Gérer les connexions multiples pour le même compte (optionnel, ici on remplace)
    clients.set(clientId, newClient);

    console.log(`[WS] ${username} connected to Collab`);

    // 1. Confirmer l'initialisation
    ws.send(JSON.stringify({
      type: 'INIT',
      data: { id: clientId, username: username }
    }));

    // 2. Envoyer la liste des utilisateurs connectés (Filtre : pas d'Admin)
    const broadcastUserList = () => {
      const onlineUsers = Array.from(clients.values()).map(c => ({ id: c.id, username: c.username }));
      const data = JSON.stringify({ type: 'USER_LIST', data: onlineUsers });
      clients.forEach(c => c.ws.send(data));
    };
    broadcastUserList();

    ws.on('message', (message: string) => {
      try {
        const parsed = JSON.parse(message);
        const { targetId, type, data } = parsed;

        const payload = JSON.stringify({
          type,
          data,
          senderId: clientId,
          senderName: username,
          timestamp: new Date().toISOString()
        });

        if (targetId && clients.has(targetId)) {
          const target = clients.get(targetId)!;
          if (target.ws.readyState === WebSocket.OPEN) {
            target.ws.send(payload);
          }
          if (type !== 'DRAW' && type !== 'CURSOR') {
            ws.send(payload);
          }
        }
      } catch (err) {
        console.error('[WS] Message error:', err);
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
      broadcastUserList();
      console.log(`[WS] ${username} left`);
    });
  });
}
