const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.use(express.json({ limit: '6mb' }))
app.use(express.urlencoded({ extended: true, limit: '6mb' }))

app.post('/', function (req, res, next) {
  res.json(req.body)
})

app.get('*', (req, res) => {
  res.status(404).send('Not Found')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
