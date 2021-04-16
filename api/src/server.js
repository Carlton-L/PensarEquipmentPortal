const express = require("express");
const { ApolloServer } = require("apollo-server-express");

const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const { AuthenticationDirective } = require("./directives");

const authRouter = require("./routes/auth");

// Create new express app
const app = express();

// Mount authentication router
// This router deals exclusively with logging in the user and returning a token and user object to the client
app.use("/auth", authRouter);

// Create new apollo server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // const token = req.headers.cookies.authToken;
    const token = process.env.TEST_TOKEN;
    // const user = req.headers.cookies.pensarUser;
    const user = {
      oid: "12345",
      name: "carltonl@pensardevelopment.com",
      preferred_username: "carltonl",
    };
    return {
      user: user,
      authenticated: false,
      authToken: token,
    };
  },
  schemaDirectives: {
    authenticated: AuthenticationDirective,
  },
  mocks: true,
  mockEntireSchema: false,
});

// Mount express middleware
server.applyMiddleware({ app });

app.listen({ port: process.env.PORT }, () => {
  console.log(`🚀 Server ready at http://localhost:${process.env.PORT}`);
});
