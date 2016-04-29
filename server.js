'use strict'

const path = require('path')
const express = require('express')
const http = require('http')

const app = express()
require('dotenv').load()
const abstraction = require('./js/abstraction.js')


app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
  res.sendFile('/public/index.html')
})
app.get('/api/imagesearch/:term', (req, res) => { //bing
  let term = req.params.term, offset = req.query.offset
  let data = abstraction.init(term, offset)
  res.json(data)
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
