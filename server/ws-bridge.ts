/**
 * server/ws-bridge.ts -- Standalone WebSocket Telemetry Server
 *
 * Low-latency WebSocket server for high-frequency telemetry broadcasting.
 * Runs as a separate process alongside Next.js.
 *
 * Usage: npx tsx server/ws-bridge.ts
 */

import { WebSocketServer, WebSocket } from 'ws';
import { createServer, IncomingMessage } from 'http';
import {
  subscribe,
  startBridge,
  isBridgeActive,
  sampleFrame,
  buildFrameMessage,
  buildHeartbeat,
  formatFrameLog,
  buildLogMessage,
  getDefaultConfig,
} from '../core/engine/telemetry-bridge';
import type { TelemetryMessage } from '../types/telemetry';

const config = getDefaultConfig();
const WS_PORT = config.wsPort;
const MAX_CLIENTS = config.maxClients;
const REQUIRE_AUTH = config.requireAuth;
const AUTH_TOKEN = process.env.TELEMETRY_TOKEN || '';
const STALE_TIMEOUT_MS = 30000;
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);

interface ClientState {
  ws: WebSocket;
  clientId: string;
  authenticated: boolean;
  lastPong: number;
}

const clients = new Map<WebSocket, ClientState>();

const httpServer = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    service: 'XENO_TELEMETRY_BRIDGE',
    status: 'OPERATIONAL',
    clients: clients.size,
    uptime: process.uptime(),
  }));
});

const wss = new WebSocketServer({
  server: httpServer,
  maxPayload: 1024,
  verifyClient: (info: { origin: string; req: IncomingMessage }, callback: (result: boolean, code?: number, reason?: string) => void) => {
    if (clients.size >= MAX_CLIENTS) {
      callback(false, 503, 'Max clients reached');
      return;
    }
    if (ALLOWED_ORIGINS.length > 0) {
      const origin = info.origin || info.req.headers.origin || '';
      if (!ALLOWED_ORIGINS.includes(origin)) {
        callback(false, 403, 'Origin not allowed');
        return;
      }
    }
    callback(true);
  },
});

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  const clientAddr = req.socket.remoteAddress || 'unknown';
  const clientState: ClientState = {
    ws,
    clientId: 'anon-' + Date.now().toString(36),
    authenticated: !REQUIRE_AUTH,
    lastPong: Date.now(),
  };
  clients.set(ws, clientState);
  log('INFO', 'Client connected: ' + clientAddr + ' (total: ' + clients.size + ')');

  if (clientState.authenticated) sendInitialFrame(ws);

  ws.on('pong', () => { clientState.lastPong = Date.now(); });

  ws.on('message', (raw: Buffer) => {
    try {
      const msg = JSON.parse(raw.toString());
      handleClientMessage(ws, clientState, msg);
    } catch {
      sendError(ws, 'Invalid JSON payload');
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    log('INFO', 'Client disconnected: ' + clientState.clientId + ' (total: ' + clients.size + ')');
  });

  ws.on('error', () => { clients.delete(ws); });
});

function handleClientMessage(ws: WebSocket, cState: ClientState, msg: Record<string, unknown>): void {
  switch (msg.type) {
    case 'auth': {
      if (!REQUIRE_AUTH) {
        cState.authenticated = true;
        sendJSON(ws, { type: 'auth_ack', seq: 0, payload: { status: 'AUTH_NOT_REQUIRED' }, timestamp: Date.now() });
        return;
      }
      if (typeof msg.token === 'string' && msg.token === AUTH_TOKEN) {
        cState.authenticated = true;
        cState.clientId = typeof msg.clientId === 'string' ? msg.clientId : cState.clientId;
        sendJSON(ws, { type: 'auth_ack', seq: 0, payload: { status: 'AUTHENTICATED' }, timestamp: Date.now() });
        sendInitialFrame(ws);
        log('INFO', 'Client authenticated: ' + cState.clientId);
      } else {
        sendError(ws, 'Authentication failed: invalid token');
        ws.close(4001, 'AUTH_FAILED');
      }
      break;
    }
    case 'ping': {
      if (!cState.authenticated) { sendError(ws, 'Not authenticated'); return; }
      sendJSON(ws, buildHeartbeat());
      break;
    }
    default:
      sendError(ws, 'Unknown message type: ' + String(msg.type));
  }
}

function initBroadcastRelay(): void {
  subscribe((msg: TelemetryMessage) => {
    const payload = JSON.stringify(msg);
    for (const [ws, cState] of clients) {
      if (cState.authenticated && ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  });
}

function sendJSON(ws: WebSocket, data: unknown): void {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
}
function sendError(ws: WebSocket, error: string): void {
  sendJSON(ws, { type: 'error', seq: 0, payload: { error }, timestamp: Date.now() });
}
function sendInitialFrame(ws: WebSocket): void {
  const frame = sampleFrame();
  sendJSON(ws, buildFrameMessage(frame));
  for (const entry of formatFrameLog(frame)) sendJSON(ws, buildLogMessage(entry));
}
function log(level: string, message: string): void {
  const ts = new Date().toISOString().slice(11, 23);
  console.log('[' + ts + '] [WS-BRIDGE] [' + level + '] ' + message);
}

// Stale connection pruning
setInterval(() => {
  const now = Date.now();
  for (const [ws, cState] of clients) {
    if (now - cState.lastPong > STALE_TIMEOUT_MS) {
      log('WARN', 'Pruning stale client: ' + cState.clientId);
      ws.terminate();
      clients.delete(ws);
    } else {
      ws.ping();
    }
  }
}, 10000);

// Boot
if (!isBridgeActive()) startBridge();
initBroadcastRelay();

httpServer.listen(WS_PORT, () => {
  log('INFO', 'Telemetry Bridge WebSocket server ONLINE on port ' + WS_PORT);
  log('INFO', 'Auth: ' + (REQUIRE_AUTH ? 'ENFORCED' : 'DISABLED') + ' | Max clients: ' + MAX_CLIENTS);
  log('INFO', 'HTTP health endpoint: http://localhost:' + WS_PORT + '/');
});