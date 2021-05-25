const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const connectDB = require("../config/db");
const {
  EmailAddressTypeDefinition,
  NonEmptyStringTypeDefinition,
  ObjectIDTypeDefinition,
  TimestampTypeDefinition,
  URLTypeDefinition,
} = require("graphql-scalars");

const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const { AuthenticationDirective } = require("./directives");
const Equipment = require("./models/Equipment");
const Record = require("./models/Record");
const ImgurAPI = require("./datasources/imgur");

const authRouter = require("./routes/auth");

// Create new express app
const app = express();

// Mount authentication router
// This router deals exclusively with logging in the user and returning a token and user object to the client
app.use("/auth", authRouter);

// Create new apollo server instance
const server = new ApolloServer({
  typeDefs: [
    typeDefs,
    EmailAddressTypeDefinition,
    NonEmptyStringTypeDefinition,
    ObjectIDTypeDefinition,
    TimestampTypeDefinition,
    URLTypeDefinition,
  ],
  resolvers,
  dataSources: () => {
    return {
      imgurAPI: new ImgurAPI(),
    };
  },
  context: ({ req }) => {
    const token =
      process.env.NODE_ENV === "development"
        ? process.env.AZURE_TEST_TOKEN
        : req.headers.cookies.authToken;
    // NOTE: User can be empty object because any @authenticated request will set the user object in the context (getUser)
    const user = {};
    return {
      user: user,
      authToken: token,
      models: {
        Equipment,
        Record,
      },
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

// Connect to MongoDB, then start server
connectDB().then(() => {
  app.listen({ port: process.env.PORT }, () => {
    console.log(`🚀 Server ready on port ${process.env.PORT}`);
  });
});
