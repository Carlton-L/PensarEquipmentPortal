const express = require("express");
const msal = require("@azure/msal-node");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

const { msalConfig: config } = require("../../config");

// Create msal application object
const cca = new msal.ConfidentialClientApplication(config);

router = express.Router();

// Auth Code Route - Retrieves an auth code url and redirects the user to login
router.get("/", (req, res) => {
  const authCodeUrlParameters = {
    scopes: ["user.read"],
    redirectUri: "http://localhost:3000/auth/redirect",
  };

  cca
    .getAuthCodeUrl(authCodeUrlParameters)
    .then((response) => {
      console.log("\nAuth Code URL:", response, "\n");
      res.redirect(response);
    })
    .catch((error) => console.log(JSON.stringify(error)));
});

// Token Route - Retrieves a JWT using a given auth code and redirects the user to their origin page
router.get("/redirect", (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    scopes: ["user.read"],
    redirectUri: "http://localhost:3000/auth/redirect",
  };

  // console.log("Redirect Request:\n", req);

  cca
    .acquireTokenByCode(tokenRequest)
    .then((response) => {
      // console.log("\nResponse: \n:", response);

      // Decode token and get kid from header
      const decodedToken = jwt.decode(response.idToken, { complete: true });
      const { oid, name, preferred_username, aud } = decodedToken.payload;
      console.log(name, preferred_username, aud);
      const kid = jwt.decode(response.idToken, { complete: true }).header.kid;
      const idToken = response.idToken;
      redirect = response.accountState;

      console.log(idToken);

      // Fetch public keys and find matching kid/public key pair and create certificate
      fetch(
        "https://login.microsoftonline.com/23a51087-bf44-49a2-ae57-2005668fec39/discovery/v2.0/keys"
      )
        .then((response) => response.json())
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
          // Remove the console.log wrapper
          console.log(
            jwt.verify(idToken, publicKey, { algorithms: ["RS256", "HS256"] })
          );
        });

      // Sets the HTTP Set-Cookie header to the idToken value
      res.cookie("authToken", idToken, { httpOnly: true });

      // Responds with the user
      res.status(200).send({ name, oid, preferred_username });
    })
    .catch((error) => {
      console.log(error);
      res.clearCookie("authToken");
      res.status(500).send(error);
    });
});

module.exports = router;
