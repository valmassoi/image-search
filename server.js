'use strict'

const path = require('path')
const express = require('express')
const http = require('http')
const param = require('jquery-param')
const got = require('got')
const mongo = require('mongodb').MongoClient

const app = express()
require('dotenv').load()
const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/data'

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
  res.sendFile('/public/index.html')
})
app.get('/api/imagesearch/:term', (request, result) => { //bing
  let term = request.params.term, offset = request.query.offset

  let item = {
     term: term,
     when: new Date()
   }

  mongo.connect(dbUrl, (err, db) => {
    if (err) throw err
    let searches = db.collection('searches')
    searches.insert(item, (err) => {
      if (err) throw err
      db.close()
    })
  })

  const params = {
    'q': term,
    'count': '10',
    'offset': offset,
    'mkt': 'en-us',
    'safeSearch': 'Moderate',
  }
  const url = 'https://bingapis.azure-api.net/api/v5/images/search?' + param(params)
  console.log(url);
  got.get(url, {
    headers: {
        'Ocp-Apim-Subscription-Key':process.env.BING_KEY1
    }
  })
  .then(res => {
    let data = JSON.parse(res.body).value
    let abstraction = data.map(d => Object.assign({}, {
      url: d.contentUrl,
      snippet: d.name,
      thumbnail: d.thumbnailUrl,
      context: d.hostPageUrl
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
    let searches = db.collection('searches').find().sort({ $natural: -1 }).limit(10)
    searches.toArray((err, list) => {
      if (err) throw err
      console.log('length: ' + list.length);
      let fullList = list.map(d => Object.assign({}, {
        term: d.term,
        when: d.when
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
