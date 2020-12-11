require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true, limit: '6mb' }));

app.set('view engine', 'ejs');

app.post('/', (req, res) => {

  // Check for API Key Integrity
  if(req.body.apiSecret !== process.env.API_SECRET) {
    return res.status(403).json({status: 'ERROR', message: 'Invalid API Key.'});
  }

  // Create a copy of the body without the API details in it
  let data = req.body;
  delete data.apiSecret;
  delete data.apiEndpoint;

  // Check the payload
  const validatePayload = require('./modules/validate-payload.js');
  if(validatePayload(data) === false) {
    return res.status(400).json({status: 'ERROR', message: 'Invalid input data.'});
  }

  // Save the json to a file for asynchronous processing
  const saveJson = require('./modules/save-json.js');
  saveJson(data).then(function() {
    res.status(200).json({status: 'SUCCESS', message: 'OK.'});
  }).catch(function() {
    res.status(500).json({status: 'ERROR', message: 'Could not write file.'});
  });

});

app.get('/json-to-gpx', (req,res) => {

  const jsonToGpx = require('./modules/json-to-gpx.js');

  jsonToGpx('json/example.json').then(function() {
    res.status(200).json({status: 'SUCCESS', message: 'JSON converted to GPX.'});
  }).catch(function() {
    res.status(500).json({status: 'ERROR', message: 'Could not convert JSON to GPX.'});
  });

});

app.get('/strava-auth', async (req, res) => {

  const getStravaAuthData = require('./modules/get-strava-auth-data.js');
  let data = await getStravaAuthData(req);

  res.render('strava-auth', { data: data });
});

app.get('/strava-auth/callback', async (req, res) => {

  const stravaTokenExchange = require('./modules/strava-token-exchange.js');
  stravaTokenExchange(req.query.code).then((result) => {
    res.redirect(301, '/strava-auth');
  }).catch(function(){
    res.status(500).json({status: 'Error', message: 'Unable to grant application access to Strava account.'})
  });

});

app.all('*', (req, res) => {
  res.status(404).json({status: 'ERROR', message: 'Not Found'})
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
