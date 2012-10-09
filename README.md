# NOT READY FOR PUBLIC CONSUMPTION !!

# Node.js FuelWatch API search thingo

This is a simple API server which acts as a proxy for the FuelWatch XML feed "API".

This server enables simple URL-based search queries. Search results are (will be) delivered in JSON, with the option of JSONP if a `?callback=` query string is appended.

Valid URL arguments are, in order:

	http://[server]/v1/s/{suburb}/{fuel type}/{day}

* **Suburb**: required.
* **Fuel type**: optional, one of ULP, PULP, Diesel, LPG, 98RON or B20. **Defaults to ULP.**
* **Day**: optional, one of "today" or "tomorrow" (tomorrow's prices only available after 2:30pm each day). **Defaults to today.**

## Usage

Find me the prices around Subiaco for ULP, today:

	curl http://[server]/v1/s/Subiaco

Find me the prices around Morley for Diesel, today:

	curl http://[server]/v1/s/Morley/Diesel

Find me the prices around Fremantle for LPG, tomorrow:

	curl http://[server]/v1/s/Fremantle/LPG/tomorrow

## TODO

* Make service work by actually returning JSON, with JSONP capability (currently spits out XML).
* Add caching of search results into MongoDB (cache cleared each day when prices roll over of course).
* Parse parameters more robustly.
* Other nice things.

## License

This FuelWatch API is released under the MIT License (see the [license](https://github.com/ocean/nfwws/blob/master/LICENSE) file) and is copyright Drew Robinson, 2012.

This client is in no way affiliated with or endorsed by FuelWatch and is intended for education purposes only. Please note FuelWatch and its associated terms are property of FuelWatch itself and there is no association between this code, myself and FuelWatch.
