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

  // Check the payload
  const validatePayload = require('./modules/validate-payload.js');
  if(validatePayload(req.body) === false) {
    return res.status(403).json({status: 'ERROR', message: 'Invalid input data'});
  }

  // Save the json to a file for asynchronous processing
  // const saveJson = require('./modules/save-json.js');
  // saveJson();

  res.status(200).json({status: 'SUCCESS', message: 'OK'});
})

app.all('*', (req, res) => {
  res.status(404).json({status: 'ERROR', message: 'Not Found'})
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
