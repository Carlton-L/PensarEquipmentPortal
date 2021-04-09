const {
  ApolloServer,
  AuthenticationError,
  SchemaDirectiveVisitor,
} = require("apollo-server");
const { defaultFieldResolver } = require("graphql");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const { getUser } = require("./auth");

class AuthenticationDirective extends SchemaDirectiveVisitor {
  visitObject(object) {
    this.ensureFieldsWrapped(object);
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
    // Get user token from header
    const token = req.headers.authorization;

    // Attempt to retrieve a user with given token
    const user = getUser(token);

    // Add user to the context
    return { user };
  },
  schemaDirectives: {
    authenticated: AuthenticationDirective,
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
