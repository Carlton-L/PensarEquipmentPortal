const {
  AuthenticationError,
  SchemaDirectiveVisitor,
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
      field.resolve = (...args) => {
        const context = args[2];

        // If the user is not authenticated yet, authenticate the user and set authenticated to true
        if (!context.authenticated) {
          console.log("Attempting to authenticate user...");
          try {
            getUser(context.cookies.authToken);
          } catch (error) {
            throw new AuthenticationError(
              `Access Denied: Authentication Failed\n${error}`
            );
          }
          context.authenticated = true;
        }

        console.log(context);

        return resolve.apply(this, args);
      };
    });
  }
}

module.exports = {
  AuthenticationDirective,
};
