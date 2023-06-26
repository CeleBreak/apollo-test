import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { Server } from 'http';

const typeDefs = `#graphql
  type Query {
    hello: String!
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
};

export const createGraphqlSchema = () => {
  let schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  return schema;
};

const createApolloServer = (httpServer?: Server) => {
  const plugins = httpServer ? [ApolloServerPluginDrainHttpServer({ httpServer })] : [];

  return new ApolloServer<any>({
    schema: createGraphqlSchema(),
    plugins,
  });
};

export default createApolloServer;