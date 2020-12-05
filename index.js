require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true, limit: '6mb' }));

app.post('/', function (req, res) {

  // Check for API Key Integrity
  if(req.body.apiSecret !== process.env.API_SECRET) {
    return res.status(403).json({status: 'ERROR', message: 'Invalid API Key'});
  }

  // Create a copy of the body without the API details in it
  let data = req.body;
  delete data.apiSecret;
  delete data.apiEndpoint;

  // Check the payload
  const validatePayload = require('./modules/validate-payload.js');
  if(validatePayload(data) === false) {
    return res.status(403).json({status: 'ERROR', message: 'Invalid input data'});
  }

  // Save the json to a file for asynchronous processing
  const saveJson = require('./modules/save-json.js');
  saveJson(data).then(function() {
    res.status(200).json({status: 'SUCCESS', message: 'OK'});
  }).catch(function() {
    res.status(500).json({status: 'ERROR', message: 'Could not write file'});
  });

})

app.all('*', (req, res) => {
  res.status(404).json({status: 'ERROR', message: 'Not Found'})
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
