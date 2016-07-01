'use strict'

const express = require('express')
const http = require('http')
const param = require('jquery-param')
const got = require('got')
const mongo = require('mongodb').MongoClient

const app = express()
require('dotenv').load()
const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/data'

app.use(express.static(`${__dirname}/public`))

app.get('/', (req, res) => {
  res.sendFile('/public/index.html')
})
app.get('/api/imagesearch/:term', (request, result) => { // bing
  const term = request.params.term
  const offset = request.query.offset
  const item = {
    term,
    when: new Date(),
  }

  mongo.connect(dbUrl, (err, db) => {
    if (err) throw err
    const searches = db.collection('searches')
    searches.insert(item, (error) => {
      if (error) throw error
      db.close()
    })
  })

  const params = {
    q: term,
    count: '10',
    offset,
    mkt: 'en-us',
    safeSearch: 'Moderate',
  }
  const url = `https://bingapis.azure-api.net/api/v5/images/search?${param(params)}`
  got.get(url, {
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.BING_KEY1,
    },
  })
  .then(res => {
    const data = JSON.parse(res.body).value
    const abstraction = data.map(d => Object.assign({}, {
      url: d.contentUrl,
      snippet: d.name,
      thumbnail: d.thumbnailUrl,
      context: d.hostPageUrl,
    }))
    result.json(abstraction)
  })
  .catch(error => {
    result.json(JSON.parse(error.response.body))
  })
})
app.get('/api/latest/imagesearch/', (req, res) => {
  mongo.connect(dbUrl, (err, db) => {
    if (err) throw err
    const searches = db.collection('searches')
                       .find().sort({ $natural: -1 })
                       .limit(10)
    searches.toArray((error, list) => {
      if (error) throw error
      const fullList = list.map(d => Object.assign({}, {
        term: d.term,
        when: d.when,
      }))
      res.json(fullList)
      db.close()
    })
  })
})
app.get('*', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('404!')
})

const port = process.env.PORT || 8080
http.createServer(app).listen(port)
console.log('Server Running on port: ' + port)
