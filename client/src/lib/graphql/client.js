// Apollo:
import {
  ApolloClient,
  ApolloLink,
  concat,
  createHttpLink,
  InMemoryCache,
  split,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
// Authentication:
import { getAccessToken } from '../auth';
// GraphQL:
import { Kind, OperationTypeNode } from 'graphql';
import { createClient as createWsClient } from 'graphql-ws';

const BASE_GQL_URL = '://localhost:9000/graphql';

// Apollo:

// Authentication:
const authLink = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    operation.setContext({
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
  return forward(operation);
});

// Adding authentication to the httpLink:
const httpLink = concat(
  authLink,
  createHttpLink({ uri: `http${BASE_GQL_URL}` })
);

// Adding web-sockets:
const wsLink = new GraphQLWsLink(
  createWsClient({
    url: `ws${BASE_GQL_URL}`,
    connectionParams: () => ({ accessToken: getAccessToken() }),
  })
);

export const apolloClient = new ApolloClient({
  link: split(isSubscription, wsLink, httpLink),
  cache: new InMemoryCache(),
});

function isSubscription(operation) {
  const definition = getMainDefinition(operation.query);

  return (
    definition.kind === Kind.OPERATION_DEFINITION &&
    definition.operation === OperationTypeNode.SUBSCRIPTION
  );
}
