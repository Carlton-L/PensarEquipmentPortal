const express = require("express");
const msal = require("@azure/msal-node");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

// Before running the sample, you will need to replace the values in the config,
// including the clientSecret
const config = {
  auth: {
    clientId: "26c3029e-6a32-424d-b557-36430eec07c4",
    authority:
      "https://login.microsoftonline.com/23a51087-bf44-49a2-ae57-2005668fec39",
    clientSecret: "3.5706EnEw_77TQpjA81d~DJUaBtpMiAQ-",
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

const SERVER_PORT = process.env.PORT || 3000;

// Create Express App and Routes
const app = express();

// Create msal application object
const cca = new msal.ConfidentialClientApplication(config);

app.get("/", (req, res) => {
  console.log(req.query.code);
  const authCodeUrlParameters = {
    scopes: ["user.read"],
    redirectUri: "http://localhost:3000/redirect",
    state: "https://carlton.dev",
  };

  // get url to sign user in and consent to scopes needed for application
  cca
    .getAuthCodeUrl(authCodeUrlParameters)
    .then((response) => {
      console.log("\nAuth Code URL:", response, "\n");
      res.redirect(response);
    })
    .catch((error) => console.log(JSON.stringify(error)));
});

app.get("/redirect", (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    scopes: ["user.read"],
    redirectUri: "http://localhost:3000/redirect",
  };

  console.log("Redirect Request:\n", req);

  // const publicKey =
  //   "-----BEGIN CERTIFICATE-----\nMIIDBTCCAe2gAwIBAgIQN33ROaIJ6bJBWDCxtmJEbjANBgkqhkiG9w0BAQsFADAtMSswKQYDVQQDEyJhY2NvdW50cy5hY2Nlc3Njb250cm9sLndpbmRvd3MubmV0MB4XDTIwMTIyMTIwNTAxN1oXDTI1MTIyMDIwNTAxN1owLTErMCkGA1UEAxMiYWNjb3VudHMuYWNjZXNzY29udHJvbC53aW5kb3dzLm5ldDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKGiy0/YZHEo9rRn2bI27u189Sq7NKhInFz5hLCSjgUB2rmf5ETNR3RJIDiW1M51LKROsTrjkl45cxK6gcVwLuEgr3L1TgmBtr/Rt/riKyxeXbLQ9LGBwaNVaJrSscxfdFbJa5J+qzUIFBiFoL7kE8ZtbkZJWBTxHEyEcNC52JJ8ydOhgvZYykete8AAVa2TZAbg4ECo9+6nMsaGsSBncRHJlRWVycq8Q4HV4faMEZmZ+iyCZRo2fZufXpn7sJwZ7CEBuw4qycHvUl6y153sUUFqsswnZGGjqpKSq7I7sVI9vjB199RarHaSSbDgL2FxjmASiUY4RqxnTjVa2XVHUwUCAwEAAaMhMB8wHQYDVR0OBBYEFI5mN5ftHloEDVNoIa8sQs7kJAeTMA0GCSqGSIb3DQEBCwUAA4IBAQBnaGnojxNgnV4+TCPZ9br4ox1nRn9tzY8b5pwKTW2McJTe0yEvrHyaItK8KbmeKJOBvASf+QwHkp+F2BAXzRiTl4Z+gNFQULPzsQWpmKlz6fIWhc7ksgpTkMK6AaTbwWYTfmpKnQw/KJm/6rboLDWYyKFpQcStu67RZ+aRvQz68Ev2ga5JsXlcOJ3gP/lE5WC1S0rjfabzdMOGP8qZQhXk4wBOgtFBaisDnbjV5pcIrjRPlhoCxvKgC/290nZ9/DLBH3TbHk8xwHXeBAnAjyAqOZij92uksAv7ZLq4MODcnQshVINXwsYshG1pQqOLwMertNaY5WtrubMRku44Dw7R\n-----END CERTIFICATE-----";

  let redirect;

  cca
    .acquireTokenByCode(tokenRequest)
    .then((response) => {
      // console.log("\nResponse: \n:", response);

      // Decode token and get kid from header
      const decodedToken = jwt.decode(response.idToken, { complete: true });
      const { name, preferred_username, aud } = decodedToken.payload;
      console.log(name, preferred_username, aud);
      const kid = jwt.decode(response.idToken, { complete: true }).header.kid;
      const idToken = response.idToken;
      redirect = response.accountState;

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
          console.log(
            jwt.verify(idToken, publicKey, { algorithms: ["RS256", "HS256"] })
          );
        });

      res.redirect(response.accountState);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send(error);
    });
});

app.listen(SERVER_PORT, () =>
  console.log(
    `Msal Node Auth Code Sample app listening on port ${SERVER_PORT}!`
  )
);
