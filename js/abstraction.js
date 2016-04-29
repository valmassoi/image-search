'use strict'
const param = require('jquery-param')
const got = require('got')
// var requestPromise = require('request-promise');

function bing(term, offset){//TODO if OFFEST 0, Mongo .insert( store search

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
    console.log(JSON.parse(res.body))
    let data = res.body// GIVE THIS TO SERVER.JS
	})
  .catch(error => {
		console.log(error.response.body); //TODO LOG ERR
	})

}

module.exports = {
  init: (term, offset) =>{
    bing(term, offset)
  }
}
