import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { WebSocketServer } from 'ws';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { createContext } from '../trpc/context';
import { appRouter } from '../trpc/router'

const port = 3001

async function start() {
  const app = express();

  app.use(cors({ credentials: true, origin: true }))
  app.use(cookieParser())
  app.use(bodyParser.json())

  app.use('/trpc', createExpressMiddleware({
    router: appRouter,
    createContext: createContext as any,
  }))

  /**
   * initialize a simple http server
   */
  const server = http.createServer(app);

  /**
   * initialize the WebSocket server instance
   */
  const wss = new WebSocketServer({ server });

  applyWSSHandler({ wss, router: appRouter, createContext });

  // start our server
  server.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}`)
  });
}

start()
