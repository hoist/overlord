FROM node:0.10.38

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ONBUILD COPY . /usr/src/app

ONBUILD RUN rm -rf node_modules

ONBUILD RUN npm install -g npm

ONBUILD RUN npm install

