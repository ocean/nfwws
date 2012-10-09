# Node.js FuelWatch API

This is a simple API server which acts as a proxy for the FuelWatch XML feed "API".

This server enables simple URL-based search queries.

Valid URL arguments are, in order:

	http://[server]/v1/s/{suburb}/{fuel type}/{day}

* *Suburb*: required.
* *Fuel type*: optional, one of ULP, PULP, Diesel, LPG, 98RON or B20. *Defaults to ULP.*
* *Day*: optional, one of "today" or "tomorrow" (tomorrow's prices only available after 2:30pm each day). *Defaults to today.*

## Usage

Find me the prices around Subiaco for ULP, today:

	curl http://[server]/v1/s/Subiaco

Find me the prices around Morley for Diesel, today:

	curl http://[server]/v1/s/Morley/Diesel

Find me the prices around Fremantle for LPG, tomorrow:

	curl http://[server]/v1/s/Fremantle/LPG/tomorrow

EOM
