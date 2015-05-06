#!/bin/bash

#source ./build-base.sh

set +e

cp task.dock Dockerfile

docker build -t quay.io/hoist/overlord:task .

rm Dockerfile
