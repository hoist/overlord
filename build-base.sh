#!/bin/bash

gtar --transform='s|base.dock|Dockerfile|' -cz * | docker build -t hoist/nodejs -
