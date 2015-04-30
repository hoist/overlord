#!/bin/bash

#source ./build-base.sh

gtar --transform='s|web.dock|Dockerfile|' -cz * | docker build -t quay.io/hoist/overlord-web -
