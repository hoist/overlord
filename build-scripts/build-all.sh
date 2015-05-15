#!/bin/bash
set -e

docker build -t quay.io/hoist/overlord:${1//feature\//} .
