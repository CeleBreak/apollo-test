import * as functions from 'firebase-functions';
// eslint-disable-next-line import/no-unresolved
import { onRequest } from 'firebase-functions/v2/https';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';

import express from 'express';
import http from 'http';
import cors from 'cors';

import createApolloServer from './createApolloServer';
const app = express();
const httpServer = http.createServer(app);

// Middleware to unwrap the `data` node when called as a cloud function
const unwrapData = function (req: functions.Request, _: functions.Response, next: express.NextFunction) {
  if (req.body.data && Object.keys(req.body).length === 1) {
    req.body = req.body.data;
  }

  next();
};

// We need the server to run tests, so createApolloServer function is intended to provide that server to tests
let server: ApolloServer | undefined;

let isServerStarted: boolean = false;
const startServer = async () => {
  if (!server) {
    server = createApolloServer(httpServer);
  }

  if (!isServerStarted) {
    await server.start();

    app.use(
      '/',
      cors<cors.CorsRequest>({ origin: '*', credentials: true }),
      express.json(),
      unwrapData,
      expressMiddleware(server),
    );
    isServerStarted = true;
  }
};

const corsHandler = cors({
  origin: '*',
  credentials: true,
});

export const coretest = onRequest(
  {
    memory: '2GiB',
    timeoutSeconds: 90,
    region: ['us-central1', 'europe-west1'],
  },
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    corsHandler(req, res, async () => {});

    await startServer();

    return app(req, res);
  },
);