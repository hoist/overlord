#!/bin/bash
set +e

./build-web.sh
./build-task.sh

mkdir -p ~/.hoist

mkdir -p ~/.hoist/test-data

docker-compose stop
docker-compose rm -f
docker-compose up -d

sleep 30s

open http://$(boot2docker ip):8000
