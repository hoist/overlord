#!/usr/bin/env bash
set +e

#setup config
echo "setting up app config"
cp /config/production.json ./config/production.json

#start app
echo "starting app"
for ((n=0;n<1000;n++)); do bash -c "babel-node ./lib/tasks/rebalancer.js"; done
