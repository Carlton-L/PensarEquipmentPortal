const express = require("express");
const { ApolloServer } = require("apollo-server-express");

const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const { AuthenticationDirective } = require("./directives");

const authRouter = require("./routes/auth");

// Create new express app
const app = express();

// Mount authentication router
app.use("/auth", authRouter);

// Create new apollo server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { user: {}, authenticated: false },
  schemaDirectives: {
    authenticated: AuthenticationDirective,
  },
  mocks: true,
  mockEntireSchema: false,
});

// Mount express middleware
server.applyMiddleware({ app });

app.listen({ port: 3000 }, () => {
  console.log(`🚀 Server ready at http://localhost:3000`);
});
