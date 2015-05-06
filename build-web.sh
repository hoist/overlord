#!/bin/bash

#source ./build-base.sh
set +e

gulp build

cp web.dock Dockerfile

docker build -t quay.io/hoist/overlord:web .

rm Dockerfile
