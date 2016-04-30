'use strict'

const path = require('path')
const express = require('express')
const http = require('http')
const param = require('jquery-param')
const got = require('got')

const app = express()
require('dotenv').load()

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
  res.sendFile('/public/index.html')
})
app.get('/api/imagesearch/:term', (request, result) => { //bing
  let term = request.params.term, offset = request.query.offset
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
app.get('/api/latest/imagesearch/', (req, res) => { //get from mongo of searches
  res.json({
    term: 'nick cage',
    when: new Date()
  })
})
app.get('*', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('404!')
})

const port = process.env.PORT || 8080
http.createServer(app).listen(port)
console.log('Server Running on port: ' + port)
