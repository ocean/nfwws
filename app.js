var express = require("express"),
	app = express(),
	http = require("http"),
	util = require("util"),
	pantry = require("pantry");

app.enable("jsonp callback");

app.use(express.logger());
app.use(express.static(__dirname + '/public'));
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('error 500', {error: err});
});

var out='';
var result={};

app.get('/', function(req,res){
	res.redirect('/v1/s');
});
app.get('/s', function(req,res){
	res.redirect('/v1/s');
});

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

	// var suburbEsc = encodeURIComponent(suburb).replace(/ /g, '%20').replace(/\'/g, '%27').replace(/\%/g, '%25');
	var suburbEsc = encodeURIComponent(suburb);
	var dayEsc = encodeURIComponent(day);
	var fwPath = '/fuelwatch/fuelWatchRSS?Suburb=' + suburbEsc + '&Product=' + fuelTypeNum + '&Day=' + dayEsc;

	// go crazy with Pantry instead of mouldy old http.request
	pantry.configure({
		maxLife: 30,
		parser: 'xml'
	});
	var fullURI = 'http://www.fuelwatch.wa.gov.au' + fwPath;
	pantry.fetch({ uri: fullURI }, function(error, data) {
		console.log('Fetching: '+fullURI);
		if (error) {
			console.log('pantry error: ' + error);
		}
		// var dump = '';
		var dump = util.inspect(data, false, null);
		// console.log(util.inspect(data, false, null, true));
		var d = data.channel[0];
		// res.end(JSON.stringify(data));
		// for (var p in d) {
		//	var o = 'data.channel[0].'+p+' = '+d[p];
		//	dump += o+'\n';
		// }
		var timeFromFWServer = String(d.lastBuildDate).substring(String(d.lastBuildDate).length/2);
		var ht = timeFromFWServer.split(' ');
		var validTime = ht[0]+' '+ht[1]+' '+ht[2]+' '+ht[5]+' '+ht[3]+' GMT+0800 (WST)';

		// really get down to rewriting a nice Object for ourselves now
		result.title = d.title; // TODO: make our own, better, title.
		result.description = d.description; // and drop this.
		result.fetchDate = new Date(validTime);
		result.queryDate = new Date();

		res.write(dump);
		res.write('\r\r'+'fetchDate = '+timeFromFWServer+' (dumb server date string)\rqueryDate = '+new Date());
		res.write('\r\r'+util.inspect(result, false, null));
		res.end();
	});
	req.on('error', function(e) {
		console.log('request error: ' + e.message);
	});

	// var options = {
	//	host: 'www.fuelwatch.wa.gov.au',
	//	path: fwPath
	// };

	// // set up http request
 //  var request = http.request(options, function(response) {
	//	var body = "";
	//	console.log('STATUS: ' + response.statusCode);
	//	// console.log('HEADERS: ' + JSON.stringify(response.headers));
	//	console.log("PATH: " + options.path);
	//	response.setEncoding("utf8");

	//	response.on("data", function(chunk){
	//		body += chunk;
	//	});

	//	response.on("end", function(){
	//		out = body;
	//		// blast out straight XML at the moment
	//		res.end(out);
	//		// use Response.jsonp() to wrap in JSONP ?callback=<blah>, but needs to be JSON first
	//		// res.jsonp(out);
	//	});
 //  });

	// request.on('error', function(e) {
	//	console.log('request error: ' + e.message);
	// });

 //  request.end();
});
// port setup with env var for AppFog
// var port = process.env.VCAP_APP_PORT || 3000;
// port setup with env var for Heroku
// try being super tricky now
var port = process.env.VCAP_APP_PORT || process.env.PORT || 3000;
app.listen(port, function(){
	console.log('Listening on ' + port);
});
