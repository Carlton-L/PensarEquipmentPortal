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
    const token =
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyJ9.eyJhdWQiOiIyNmMzMDI5ZS02YTMyLTQyNGQtYjU1Ny0zNjQzMGVlYzA3YzQiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vMjNhNTEwODctYmY0NC00OWEyLWFlNTctMjAwNTY2OGZlYzM5L3YyLjAiLCJpYXQiOjE2MTg1MzM3ODUsIm5iZiI6MTYxODUzMzc4NSwiZXhwIjoxNjE4NTM3Njg1LCJuYW1lIjoiQ2FybHRvbiBMaW5kc2F5Iiwib2lkIjoiOTMzNjVmMTYtMTk1Zi00ZTEwLThhMjgtMmRhNTA2MDYwMmViIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiY2FybHRvbmxAcGVuc2FyZGV2ZWxvcG1lbnQuY29tIiwicmgiOiIwLkFXNEFoeENsSTBTX29rbXVWeUFGWm9fc09aNEN3eVl5YWsxQ3RWYzJRdzdzQjhSdUFMZy4iLCJzdWIiOiI5RklVOXpFb2FtaWxkX1VWdnpXMWdNNzYwdEhTSkl5cmNUWGxLQkZFeElrIiwidGlkIjoiMjNhNTEwODctYmY0NC00OWEyLWFlNTctMjAwNTY2OGZlYzM5IiwidXRpIjoiY3B5WFUyTnY1a0NrMTVyWllUR19BQSIsInZlciI6IjIuMCJ9.dP9p7jFjcMKe7qoPsgd8G5c32k8XH7T_BCaApsahrpRh8koVnBhedvlWUhlBkWdSXzSKpo9AdjBlOmQFfKTf_JZ121A0sk4fR7-IMuLKwuozHPQg_vcXA00IKcBYYRfXmBgTH7yT7S9qhnHQpxooROG47BZy5xC19v3k3plR4LfVssndr9c57brnwwQRj3ne60__Zm6u0pdxagRWTq5aqyAywGqtR0gMGYUOw30kkdYziv55wTEBkr6lKzhjpDuI5ioN3-IkfS2rfUBJjwIcNb1b7CxF9Xw5z1_a56nZ5joAkDWLmMd5ORpcD1vm7QIX5PEimimIn5b6u3Bc9GmONw";
    return {
      user: {},
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
