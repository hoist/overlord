#!/bin/bash

set +e

gulp build

cp dockerfiles/base.dock Dockerfile

docker build -t quay.io/hoist/overlord:base .

rm Dockerfile
