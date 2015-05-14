#!/bin/bash
set -e

gulp build

docker build -t quay.io/hoist/overlord:${1//feature\//} .
