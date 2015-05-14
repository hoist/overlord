#!/bin/bash
set +e

./build-scripts/build-all.sh

mkdir -p ~/.hoist

mkdir -p ~/.hoist/test-data

docker-compose stop
docker-compose rm -f
docker-compose up -d

sleep 5s

open http://$(boot2docker ip):8000
