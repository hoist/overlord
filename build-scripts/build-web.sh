#!/bin/bash

set +e

cp dockerfiles/web.dock Dockerfile

docker build -t quay.io/hoist/overlord:web${1} .

rm Dockerfile
