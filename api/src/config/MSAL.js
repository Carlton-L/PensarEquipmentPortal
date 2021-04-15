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

module.exports = {
  config,
};
