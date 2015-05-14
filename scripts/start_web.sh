#!/usr/bin/env bash
set +e

#setup ssh for fleet
echo "setting up ssh for fleetctl"
eval $(ssh-agent -s)
mkdir -p ~/.ssh
cp /config/internal ~/.ssh/internal
ssh-add ~/.ssh/internal

#setup config
echo "setting up app config"
cp /config/production.json ./config/production.json

#migrate database
echo "migrating database"
mongoose-data-migrate up

#start app
echo "starting app"
node web_server.js
