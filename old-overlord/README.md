# overlord
Hoist's Infrastructure Management Portal


#Running via Docker

You're most likely running on OSX so there are a couple of requirements:

* install (https://docs.docker.com/installation/mac/)[boot2docker]
* install (https://docs.docker.com/compose/install/)[docker compose]

```
curl -L https://github.com/docker/compose/releases/download/1.2.0/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

boot 2 docker has some odd filesystem issues so you'll need fusefs installed if you want to link the test databases

* install sshfs
```
brew install Caskroom/cask/osxfuse
brew install sshfs

```
* create a mapped directory on the boot2docker vm
from (https://gist.github.com/sevastos/2fa4c86f01541351efe8)
```
boot2docker up (or init then up)
boot2docker ssh
sudo mkdir -p /mnt/sda1/dev
exit
mkdir -p ~/.hoist
mkdir -p ~/.hoist/test-data
sshfs docker@localhost:/mnt/sda1/dev ~/.hoist/test-data/ -p 2022
tcuser (is the password)
```

ok that should be all.
*you'll need to be logged into the Hoist quay.io account for these commands to work*

*recreate docker images and run them*
```
./run-docker.sh
```
*just create the docker images*
```
./build-docker.sh
or
./build-web.sh
./build-task.sh
```
*just run the current images*
```
docker-compose up
```

of course you can still run the app without docker (it will look for a local mongo server)
node web_server.js
or
node task_server.js








