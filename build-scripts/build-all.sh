#!/bin/bash
set -e

./build-scripts/build-base.sh
./build-scripts/build-web.sh ${1}
./build-scripts/build-task.sh ${1}
