const express = require('express');
const msal = require('@azure/msal-node');
const jwt = require('jsonwebtoken');

// Before running the sample, you will need to replace the values in the config,
// including the clientSecret
const config = {
  auth: {
    clientId: '26c3029e-6a32-424d-b557-36430eec07c4',
    authority:
      'https://login.microsoftonline.com/23a51087-bf44-49a2-ae57-2005668fec39',
    clientSecret: '3.5706EnEw_77TQpjA81d~DJUaBtpMiAQ-',
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

app.get('/', (req, res) => {
  const authCodeUrlParameters = {
    scopes: ['user.read'],
    redirectUri: 'http://localhost:3000/redirect',
  };

  // get url to sign user in and consent to scopes needed for application
  cca
    .getAuthCodeUrl(authCodeUrlParameters)
    .then((response) => {
      console.log(response);
      res.redirect(response);
    })
    .catch((error) => console.log(JSON.stringify(error)));
});

app.get('/redirect', (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    scopes: ['user.read'],
    redirectUri: 'http://localhost:3000/redirect',
  };

  cca
    .acquireTokenByCode(tokenRequest)
    .then((response) => {
      console.log('\nResponse: \n:', response);
      console.log(config.auth.clientSecret);
      try {
        console.log(jwt.verify(response.idToken, config.auth.clientSecret));
      } catch (err) {
        console.log(err);
      }
      res.sendStatus(200);
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
