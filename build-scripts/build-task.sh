#!/bin/bash

set +e

cp dockerfiles/task.dock Dockerfile

docker build -t quay.io/hoist/overlord:task${1//feature\//} .

rm Dockerfile
