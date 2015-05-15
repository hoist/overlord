#!/bin/bash
set -e

docker push quay.io/hoist/overlord:${1//feature\//}
