const { ApolloError } = require("apollo-server-errors");

class OperationError extends ApolloError {
  constructor(message) {
    super(message, "INVALID_OPERATION");

    Object.defineProperty(this, "name", { value: "OperationError" });
  }
}

class DocumentNonExistentError extends ApolloError {
  constructor(message) {
    super(message, "DOCUMENT_NOT_FOUND");

    Object.defineProperty(this, "name", { value: "DocumentNonExistentError" });
  }
}

class FileTypeError extends ApolloError {
  constructor(message) {
    super(message, "UNSUPPORTED_FILE_TYPE");

    Object.defineProperty(this, "name", { value: "FileTypeError" });
  }
}

class ImgurError extends ApolloError {
  constructor(message) {
    super(message, "IMGUR_API_ERROR");

    Object.defineProperty(this, "name", { value: "ImgurError" });
  }
}

module.exports = {
  OperationError,
  DocumentNonExistentError,
  FileTypeError,
};
