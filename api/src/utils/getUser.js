const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

// Fetch public keys (returns a Promise)
const getPublicKeys = () => {
  return fetch(
    `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/discovery/v2.0/keys`
  )
    .then((response) => response.json())
    .catch((error) => {
      return Promise.reject(Error(error.message));
    });
};

// Validate token and get user information
const getUser = async (token) => {
  // Attempt to decode the passed in token
  const decodedToken = jwt.decode(token, { complete: true });
  const { kid } = decodedToken.header;

  // Fetch public keys
  return getPublicKeys()
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
      return jwt.verify(
        token,
        publicKey,
        {
          algorithms: ["RS256", "HS256"],
          audience: process.env.AZURE_CLIENT_ID,
        },
        (error, decoded) => {
          if (error) {
            console.log(
              `User ${decodedToken.payload.name} failed to authenticate`
            );
            return Promise.reject(Error(error));
          } else {
            const { aud, name, oid, preferred_username } = decoded.payload;
            console.log(`User ${name} authenticated successfully`);
            return { aud, name, oid, preferred_username };
          }
        }
      );
    });
  // return { aud, name, oid, preferred_username };
};

module.exports = {
  getUser,
};
