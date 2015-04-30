#!/bin/bash

#source ./build-base.sh

gtar --transform='s|task.dock|Dockerfile|' -cz * | docker build -t hoist/overlord-tasks -
