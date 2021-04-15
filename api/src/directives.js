const {
  AuthenticationError,
  SchemaDirectiveVisitor,
} = require("apollo-server-express");

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

module.exports = {
  AuthenticationDirective,
};
