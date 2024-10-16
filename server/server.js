// 3rd party:
import cors from 'cors';
// Node:
import { readFile } from 'node:fs/promises';
import { createServer as createHttpServer } from 'node:http';
// Apollo:
import { ApolloServer } from '@apollo/server';
import { expressMiddleware as apolloMiddleware } from '@apollo/server/express4';
// Express:
import express from 'express';
// Web-Socket:
import { WebSocketServer } from 'ws';
// Authentication:
import { authMiddleware, handleLogin, decodeToken } from './auth.js';
// GraphQL:
import { resolvers } from './resolvers.js';
import { useServer as useWsServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';

// Express server:
const PORT = 9000;

const app = express();
app.use(cors(), express.json());

app.post('/login', handleLogin);

function getHttpContext({ req }) {
  if (req.auth) {
    return { user: req.auth.sub };
  }
  return {};
}

// GraphQL:
const typeDefs = await readFile('./schema.graphql', 'utf8');
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Apollo server:
const apolloServer = new ApolloServer({ schema });
await apolloServer.start();
app.use(
  '/graphql',
  authMiddleware,
  apolloMiddleware(apolloServer, {
    context: getHttpContext,
  })
);

// Web-Socket server:
const httpServer = createHttpServer(app);
const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });

function getWsContext({ connectionParams }) {
  const accessToken = connectionParams?.accessToken;
  if (accessToken) {
    const payload = decodeToken(accessToken);
    return { user: payload.sub };
  }
  return {};
}
useWsServer({ schema, context: getWsContext }, wsServer);

httpServer.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
});
