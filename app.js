var express = require('express'),
	app = express(),
	http = require('http'),
	util = require('util'),
	morgan = require('morgan'),
	pantry = require('pantry');

app.enable('jsonp callback');

// Morgan is a replacement for express.logger()
app.use(morgan('combined'));

app.use(express.static(__dirname + '/public'));
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('error 500', {
    error: err
  });
});

var out='';
var result={};

app.get('/', function (req, res) {
  res.redirect('/v1/s');
});
app.get('/s', function (req, res) {
  res.redirect('/v1/s');
});

// Version 1 of the API :)
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

	var suburbEsc = encodeURIComponent(suburb);
	var dayEsc = encodeURIComponent(day);
	var fwPath = '/fuelwatch/fuelWatchRSS?Suburb=' + suburbEsc + '&Product=' + fuelTypeNum + '&Day=' + dayEsc;

	// go crazy with Pantry instead of mouldy old http.request
	pantry.configure({
		maxLife: 600,
		parser: 'xml'
	});
	var fullURI = 'http://www.fuelwatch.wa.gov.au' + fwPath;
	pantry.fetch({ uri: fullURI }, function ( error, data ) {
		console.log('Fetching: ' + fullURI);
		if (error) {
			console.log('pantry error: ' + error);
		}
		// var dump = util.inspect(data, false, null);
		var d = data.channel[0];
		var timeFromFWServer = String(d.lastBuildDate).substring(String(d.lastBuildDate).length/2);
		var ht = timeFromFWServer.split(' ');
		var validTime = ht[0] + ' ' + ht[1] + ' ' + ht[2] + ' ' + ht[5] + ' ' + ht[3] + ' GMT+0800 (WST)';

		// really get down to rewriting a nice Object for ourselves now
		var responseTitle = d.title[0].toString() + ' for ' + d.description[0].split(' ')[0].toString();
		result.title = responseTitle;
		result.dataFetchedDate = new Date(validTime);
		result.requestDate = new Date();
		result.locations = [];

		result.locations = d.item.map(function(l) {
			var location = {
				title: l.title[0],
				tradingName: l['trading-name'][0],
				streetAddress: l.address[0],
				suburb: l.location[0],
				latitude: l.latitude[0],
				longitude: l.longitude[0],
				description: l.description[0],
			};
			return location;
		});

		// res.write(dump);
		// res.write(JSON.stringify(dump));

		// res.write(JSON.stringify(data, null, '  '));
		// res.write('\r\r' + JSON.stringify(result, null, '  '));

		// res.write(JSON.stringify(result, null, '  '));
		res.jsonp(result);
		res.end();
	});
	req.on('error', function(e) {
		console.log('request error: ' + e.message);
	});
});
// port setup with env var for Heroku
var port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log('Listening on ' + port);
});
