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
    this.ensureFieldsWrapped(details.objectType, field.name);
  }

  ensureFieldsWrapped(objectType, fieldName) {
    // NOTE: The fieldName argument is optional, and only used when wrapping a single field

    // Mark the GraphQLObjectType object to avoid re-wrapping
    if (objectType._authFieldsWrapped) return;

    // Check to see if the object (or parent object in the case of a field) has already been wrapped
    objectType._authFieldsWrapped = true;

    // Declare auth function to be run on each field
    const auth = (field) => {
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
        return resolve.apply(this, args);
      };
    };

    // Get an array of all fields on an object
    const fields = objectType.getFields();

    // Check if we're looking at an object or a field
    if (!fieldName) {
      // If no fieldName was passed in, it's an object

      // Iterate through each of the fields and apply the auth function to each
      Object.keys(fields).forEach((field) => auth(fields[field]));
    } else {
      // Otherwise it's a field (whose parent object has not been iterated through before)

      // Just run once on the single field that was passed in
      auth(fields[fieldName]);
    }
  }
}

module.exports = {
  AuthenticationDirective,
};
