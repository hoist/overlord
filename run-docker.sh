#!/bin/bash
set +e

./build-web.sh
./build-task.sh

mkdir -p ~/.hoist

mkdir -p ~/.hoist/test-data

docker-compose up
