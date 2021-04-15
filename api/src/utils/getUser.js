const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

// Fetch public keys (returns a Promise)
const getPublicKeys = () => {
  return fetch(
    "https://login.microsoftonline.com/23a51087-bf44-49a2-ae57-2005668fec39/discovery/v2.0/keys"
  )
    .then((response) => response.json())
    .catch((error) => {
      return Promise.reject(Error(error.message));
    });
};

// Validate token and get user information
const getUser = (token) => {
  // Attempt to decode the passed in token
  const decodedToken = jwt.decode(token, { complete: true });
  const { kid } = decodedToken.header;
  const { aud, name, oid, preferred_username } = decodedToken.payload;

  // Fetch public keys
  getPublicKeys()
    .then((response) => {
      // Format the public key as a certificate
      return `-----BEGIN CERTIFICATE-----\n${response.keys
        .map((key) => {
          if (key.kid === kid) {
            return key.x5c[0];
          }
        })
        .filter(
          (element) => element !== undefined
        )}\n-----END CERTIFICATE-----`;
    })
    .then((publicKey) => {
      // Verify the passed in token against the public key certificate
      jwt.verify(idToken, publicKey, {
        algorithms: ["RS256", "HS256"],
        audience:
          "https://login.microsoftonline.com/23a51087-bf44-49a2-ae57-2005668fec39/v2.0",
      });
    });

  return { aud, name, oid, preferred_username };
};

module.exports = {
  getUser,
};
