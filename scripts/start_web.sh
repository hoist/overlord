#!/usr/bin/env bash
mongoose-data-migrate up
cp /config/production.json ./config/production.json
node web_server.js
