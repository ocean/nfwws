var express = require("express");
var app = express();
var http = require("http");

app.enable("jsonp callback");

app.use(express.logger());
app.use(express.static(__dirname + '/public'));

var out='';

//Version 1 of the API :)
app.get('/v1/s/:suburb?/:fuelType?/:day?', function(req, res) {
	// Ignore browser requests for Favicon
	if (req.url=="/favicon.ico") return false;

	// Get search params from URL path, or use defaults
	var suburb = req.params.suburb || 'Subiaco';
	var fuelType = req.params.fuelType || 'ULP';
	// can be "tomorrow" but only after 14:30.
	var day = req.params.day || 'today';
	var fuelTypeNum = 1;
	switch (fuelType) {
		case 'ULP':
			fuelTypeNum = 1;
			break;
		case 'PULP':
			fuelTypeNum = 2;
			break;
		case 'Diesel':
			fuelTypeNum = 4;
			break;
		case 'LPG':
			fuelTypeNum = 5;
			break;
		case '98RON':
			fuelTypeNum = 6;
			break;
		case 'B20':
			fuelTypeNum = 7;
			break;
	}

	var response = '';

	var suburbEsc = encodeURIComponent(suburb).replace(/ /g, '%20').replace(/\'/g, '%27').replace(/\%/g, '%25');
	var fwPath = '/fuelwatch/fuelWatchRSS?Suburb=' + suburbEsc + '&Product=' + fuelTypeNum;

	var options = {
		host: 'www.fuelwatch.wa.gov.au',
		path: fwPath
	};

	// set up http request
  var request = http.request(options, function(response) {
		var body = "";
		console.log('STATUS: ' + response.statusCode);
		// console.log('HEADERS: ' + JSON.stringify(response.headers));
		console.log("PATH: " + options.path);
		response.setEncoding("utf8");

		response.on("data", function(chunk){
			body += chunk;
		});

		response.on("end", function(){
			out = body;
			res.end(out);
		});
  });
  request.end();

	// this is important - you must use Response.jsonp()
	// res.jsonp('searching for ' + fuelType + ' in ' + suburb);
});
app.listen(process.env.VCAP_APP_PORT || 3000);
console.log('Listening on 3000');
