const http = require('http');
const https = require('https');

const protocols = ['http', 'https'];

function checkWebsite(url) {
    return new Promise((resolve, reject) => {
      http
        .get(url, function(res) {
          res.endTime = new Date();
          resolve(res);
        })
        .on("error", function(e) {
		      console.log(e);
          resolve(res);
        });     
    })
}

function checkWebsiteSecure(url) {
    return new Promise((resolve, reject) => {
      https
        .get(url, function(res) {
          res.endTime = new Date();
          resolve(res);
        })
        .on("error", function(e) {
		      console.log(e);
          resolve(res);
        });     
    })
}

async function isUrlUp(url){
	var check;
	if(url.protocol.toString().toLowerCase() === "http:"){
		check = await checkWebsite(url);
		// console.log(check);
    return check;
	}
	if(url.protocol.toString().toLowerCase() === "https:"){
		check = await checkWebsiteSecure(url);
		// console.log(check);
    return check;
	}
}

function stringIsAValidUrl(url){
    try {
        return url.protocol 
		? protocols.map(x => `${x.toLowerCase()}:`).includes(url.protocol)
		: false;
    } catch (err) {
        return false;
    }
};

module.exports = { isUrlUp, stringIsAValidUrl};