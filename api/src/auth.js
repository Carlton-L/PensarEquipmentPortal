const jwt = require("jwt");
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
  const decodedToken = jwt.decode(token, { complete: true });
  const kid = decodedToken.header.kid;
  const { aud, name, oid, preferred_username } = decodedToken.payload;

  // Check the passed in token against the cached public keys

  // If the cached public keys don't exist or the token fails to validate (NOT TokenExpiredError)

  // Fetch public keys
  getPublicKeys()
    .then((response) => {
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
      console.log(
        jwt.verify(idToken, publicKey, { algorithms: ["RS256", "HS256"] })
      );
    });

  return {};
};

module.exports = {
  getUser,
};
