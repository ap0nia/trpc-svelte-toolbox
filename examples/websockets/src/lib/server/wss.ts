import { parse } from 'url';
import { WebSocketServer } from 'ws';
import type { Server,  WebSocket as WebSocketBase } from 'ws';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import type { Handle } from '@sveltejs/kit';

export const GlobalThisWSS = Symbol.for('sveltekit.wss');

export interface ExtendedWebSocket extends WebSocketBase {
  socketId: string;
};

export const onHttpServerUpgrade = (req: IncomingMessage, sock: Duplex, head: Buffer) => {
    const pathname = parse(req.url ?? '').pathname;
    if (pathname !== '/trpc') return;

    const wss = globalThis[GlobalThisWSS] as Server;

    wss.handleUpgrade(req, sock, head, function done(ws) {
      wss.emit('connection', ws, req);
    });
};

function createWSSHandle(): Handle {
  const wss = new WebSocketServer({ noServer: true }) as Server<ExtendedWebSocket>;

  wss.on('connection', (ws) => {
    ws.socketId = '123';

    console.log(`[wss:global] client connected (${ws.socketId})`);

    ws.on('close', () => {
      console.log(`[wss:global] client disconnected (${ws.socketId})`);
    });
  });

  return async ({ event, resolve }) => {
    event.locals.wss = wss
    return resolve(event)
  }
}
