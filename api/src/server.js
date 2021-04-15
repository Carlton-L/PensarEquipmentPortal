const express = require("express");
const {
  ApolloServer,
  AuthenticationError,
  SchemaDirectiveVisitor,
} = require("apollo-server-express");
const { defaultFieldResolver } = require("graphql");
const msal = require("@azure/msal-node");

const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const { getUser } = require("./auth");
const { config } = require("/config/MSAL");

// Checks that the user is authenticated
class AuthenticationDirective extends SchemaDirectiveVisitor {
  visitObject(object) {
    this.ensureFieldsWrapped(object);
  }

  visitFieldDefinition(field, details) {
    this.ensureFieldsWrapped(details.objectType);
  }

  ensureFieldsWrapped(objectType) {
    // Mark the GraphQLObjectType object to avoid re-wrapping
    if (objectType._authFieldsWrapped) return;
    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;
      field.resolve = (root, args, context, info) => {
        const user = context.user;
        console.log("Authenticating...");
        if (!user) {
          throw new AuthenticationError(
            "Access Denied: Authentication Failed."
          );
        }

        return resolve.apply(this, args);
      };
    });
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.cookies.authToken;

    return { token };
  },
  schemaDirectives: {
    authenticated: AuthenticationDirective,
  },
  mocks: true,
});

// Create msal application object
const cca = new msal.ConfidentialClientApplication(config);
// Create new express app
const app = express();

server.applyMiddleWare({ app });

// Authentication Route -
app.get("/auth", (req, res) => {
  const authCodeUrlParameters = {
    scopes: ["user.read"],
    redirectUri: "http://localhost:3000/redirect",
  };

  // get url to sign user in and consent to scopes needed for application
  cca
    .getAuthCodeUrl(authCodeUrlParameters)
    .then((response) => {
      console.log("\nAuth Code URL:", response, "\n");
      res.redirect(response);
    })
    .catch((error) => console.log(JSON.stringify(error)));
});

app.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
