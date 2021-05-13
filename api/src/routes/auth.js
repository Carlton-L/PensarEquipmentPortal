const express = require("express");
const msal = require("@azure/msal-node");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const { Router } = require("express");

const config = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    knownAuthorities: ["http://login.microsoftonline.com"],
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

      // Sets the HTTP Set-Cookie header to the idToken value
      res.cookie("authToken", idToken, { httpOnly: true });

      // Sets the HTTP Set-Cookie header to the user decoded from the idToken
      res.cookie(
        "pensarUser",
        { name: name, id: oid, email: preferred_username },
        { httpOnly: true }
      );

      // Responds with the user
      // res.status(200).send({ name, oid, preferred_username });

      console.log(`Logged in ${name}`);

      // HACK: Auto-redirect to graphQL interface and set environment variable
      process.env.AZURE_TEST_TOKEN = idToken;
      res.redirect("http://localhost:3000/graphql");
    })
    .catch((error) => {
      console.log(error);
      res.clearCookie("authToken");
      res.status(500).send(error);
    });
});

router.get("/logout", (req, res) => {});

// TODO: Create route for logout (clear the user's cookies/session data)

module.exports = router;
