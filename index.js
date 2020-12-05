require('dotenv').config()

const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.use(express.json({ limit: '6mb' }))
app.use(express.urlencoded({ extended: true, limit: '6mb' }))

app.post('/', function (req, res, next) {
  if(req.body.apiSecret === process.env.API_SECRET) {
    res.status(200).json({status: 'SUCCESS', message: 'OK'})
  } else {
    res.status(403).json({status: 'ERROR', message: 'Invalid API Key'})
  }
})

app.get('*', (req, res) => {
  res.status(404).send('Not Found')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
