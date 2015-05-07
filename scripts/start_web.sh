#!/usr/bin/env bash
cp /config/production.json ./config/production.json
mongoose-migrate
node web_server.js
