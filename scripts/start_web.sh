#!/usr/bin/env bash

cp /config/production.json ./config/production.json
mongoose-data-migrate up
node web_server.js
