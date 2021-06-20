const express = require("express");
const msal = require("@azure/msal-node");
const jwt = require("jsonwebtoken");

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
// HACK: redirectUri must be hard-coded (no template strings)
router.get("/", (req, res) => {
  const authCodeUrlParameters = {
    scopes: ["user.read"],
    redirectUri: "http://localhost:80/auth/redirect",
  };

  cca
    .getAuthCodeUrl(authCodeUrlParameters)
    .then((response) => {
      res.redirect(response);
    })
    .catch((error) => console.log(JSON.stringify(error)));
});

// Token Route - Retrieves a JWT using a given auth code and redirects the user to their origin page
// HACK: redirectUri must be hard-coded (no template strings)
router.get("/redirect", (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    scopes: ["user.read"],
    redirectUri: "http://localhost:80/auth/redirect",
  };

  // console.log("Redirect Request:\n", req);

  cca
    .acquireTokenByCode(tokenRequest)
    .then((response) => {
      // console.log("\nResponse: \n:", response);

      // Decode token and get kid from header
      const decodedToken = jwt.decode(response.idToken, { complete: true });
      const { oid, name, preferred_username, exp, aud } = decodedToken.payload;
      const idToken = response.idToken;

      /*
idToken payload:
{
  "aud": "26c3029e-6a32-424d-b557-36430eec07c4",
  "iss": "https://login.microsoftonline.com/23a51087-bf44-49a2-ae57-2005668fec39/v2.0",
  "iat": 1623897417,
  "nbf": 1623897417,
  "exp": 1623901317,
  "name": "Carlton Lindsay",
  "oid": "93365f16-195f-4e10-8a28-2da5060602eb",
  "preferred_username": "carltonl@pensardevelopment.com",
  "rh": "0.AW4AhxClI0S_okmuVyAFZo_sOZ4CwyYyak1CtVc2Qw7sB8RuALg.",
  "sub": "9FIU9zEoamild_UVvzW1gM760tHSJIyrcTXlKBFExIk",
  "tid": "23a51087-bf44-49a2-ae57-2005668fec39",
  "uti": "zSN5SvjKP0Oj4lc-pOpNAA",
  "ver": "2.0"
}
*/

      // Sets a cookie for the token expiration date (used by frontend auth)
      // NOTE: This sets a non-protected cookie for use by the frontend application
      res.cookie("authExpires", exp, { httpOnly: false });

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
      res.redirect("http://localhost:80/graphql");
    })
    .catch((error) => {
      console.log(error);
      res.clearCookie("authToken");
      res.status(500).send(error);
    });
});

router.get("/logout", (req, res) => {
  // TODO: Create route for logout (clear the user's cookies/session data)
  res.clearCookie("authToken");
  res.clearCookie("pensarUser");
});

module.exports = router;
