require('dotenv').config();

// Setup Express
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true, limit: '6mb' }));
app.enable('trust proxy', true);

app.set('view engine', 'ejs');

// Custom functions
const log = require('./modules/logger.js');
const queueJsonForProcessing = require('./modules/queue-json-for-processing.js');
const saveJson = require('./modules/save-json.js');
const validateApiKey = require('./modules/validate-api-key.js');
const validatePayload = require('./modules/validate-payload.js');

/**
 * React to incoming json data POSTed to the root from Runkeeper (via Zapier).
 */
app.post('/', (req, res) => {

  // Check for API Key Integrity
  if(validateApiKey(req.body.apiKey) === false) {

    let error = {
      status: 401,
      message: 'Unauthorized',
      details: 'ERROR: Invalid API key.'
    };

    log(error);

    return res.status(error.status).json(error);

  }

  // Create a copy of the body without the API details in it
  let data = req.body;
  delete data.apiKey;
  delete data.apiEndpoint;

  // Check the payload
  if(validatePayload(data) === false) {
    let error = {
      status: 400,
      message: 'Bad Request',
      details: 'ERROR: Invalid input data.'
    };

    log(error);

    return res.status(error.status).json(error);

  }

  // Save the json to a file the queue for asynchronous processing
  saveJson(data).then((jsonFilename) => {

    queueJsonForProcessing(jsonFilename);

    let response = {
      status: 200,
      message: 'OK',
      details: 'JSON data successfully saved. Processing will be attempted shortly.'
    };

    res.status(response.status).json(response);

  }).catch((err) => {

    let error = {
      status: 500,
      message: 'Internal Server Error',
      details: `ERROR: ${err.message}`
    }

    log(error);

    delete error.details; // Don't expose server error to caller

    res.status(error.status).json(error);

  });

});


/**
 * Strava OAuth Page:
 * This is a page where the app administrator can authorize a Strava account which will
 * receive Runkeeper activities as GPX files via the Strava Uploads API.
 */
app.all(/^\/strava-auth$/, async (req, res) => {

  if(
    (req.method === "POST" && req.body.apiKey && req.body.apiKey === process.env.API_KEY) ||
    (req.method === "GET" && req.query.apiKey && req.query.apiKey === process.env.API_KEY)
  ) {

    const stravaAuthViewData = require('./modules/strava-auth-view-data.js');
    let data = await stravaAuthViewData(req);

    res.render('strava-auth', { data: data });

  }

  else if(
    (req.method === "POST" && (!req.body.apiKey || req.body.apiKey !== process.env.API_KEY)) ||
    (req.method === "GET" && (req.query.apiKey && req.query.apiKey !== process.env.API_KEY))
  ) {
    res.render('login', { message: "Incorrect API Key." });
  }

  else {
    res.render('login', { message: "" });
  }

});

/**
 * OAuth Callback Page:
 * When authorization is granted to a Strava account, this function handles the
 * callback and subsequent token exchange.
 */
app.get('/strava-auth/callback', (req, res) => {

  // The API key should be passed back in the state so we know the authorisation
  // was made by someone who has the credentials for this instance of the application.
  if(req.query.state !== process.env.API_KEY) {

    let error = {
      status: 401,
      message: 'Unauthorized',
      details: 'ERROR: Invalid API key. Could not authorize Strava account'
    }

    return res.status(error.status).json(error);
  }

  // Attempt to exchange the callback code for a Strava authorisation token
  const stravaTokenExchange = require('./modules/strava-token-exchange.js');
  stravaTokenExchange(req.query.code).then((result) => {

    // On success, just redirect back to the OAuth page which will now show the
    // details of the authenticated user.
    res.redirect(301, '/strava-auth?apiKey=' + encodeURIComponent(req.query.state));

  }).catch((err) => {

    let error = {
      status: 500,
      message: 'Internal Server Error',
      details: `ERROR: ${err.message}`
    }

    log(error);

    delete error.details; // Don't expose server error to caller

    res.status(error.status).json(error);

  });

});


/**
 * Respond to a GET request for the root. This endpoint can be requested from
 * an external service e.g. via the serverless script in
 * ./external/runkeeper-strava-sync-ping.js to keep the app awake, ready to
 * receive JSON data throughout the day.
 */
app.get('/', (req, res) => {

  const log = require('./modules/logger.js');

  let response = {
    status: 200,
    message: 'OK',
    details: 'Ping pong! The app is awake.'
  }

  log(response);

  res.status(200).json(response);

});

/**
 * All other routes should 404
 */
app.all('*', (req, res) => {
  res.status(404).json({ status: 404, message: 'Not Found', details: 'Page not found.' });
});


/**
 * Start the server
 */
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
