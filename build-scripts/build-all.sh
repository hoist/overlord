#!/bin/bash
set +e
echo ${1}

./build-scripts/build-base.sh
./build-scripts/build-web.sh ${1}
./build-scripts/build-task.sh ${1}
