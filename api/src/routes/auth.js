const express = require("express");
const msal = require("@azure/msal-node");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

const config = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Verbose,
    },
  },
};

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
      const idToken = response.idToken;

      console.log(name, preferred_username, aud);

      console.log(idToken);

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
