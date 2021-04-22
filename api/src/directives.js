const {
  AuthenticationError,
  SchemaDirectiveVisitor,
  forEachField,
} = require("apollo-server-express");
const { defaultFieldResolver } = require("graphql");
const { getUser } = require("./utils/getUser");

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
      field.resolve = async (...args) => {
        const context = args[2];

        // Authenticate the user
        console.log("Attempting to authenticate user...");
        // Get user from a given auth token
        try {
          context.user = await getUser(context.authToken);
          console.log(`User ${context.user.name} authenticated successfully`);
        } catch (error) {
          console.log(`Authentication failed: ${error.message}`);
          // NOTE: Stack trace is removed from this error if NODE_ENV is set to "production" or "test"
          throw new AuthenticationError(error.message);
        }

        console.log(context.user);

        return resolve.apply(this, args);
      };
    });
  }
}

module.exports = {
  AuthenticationDirective,
};
