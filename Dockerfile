FROM node:0.10

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

ENV NODE_MONGOOSE_MIGRATIONS_CONFIG=./config/migrations.js

ADD package.json /usr/src/app/package.json

RUN npm config set loglevel warn
RUN npm install mongoose-data-migrate -g
RUN npm install -g npm
RUN npm install -g nodemon
RUN npm install -g gulp
RUN npm install

ENV NODE_HEAPDUMP_OPTIONS=nosignal

ADD . /usr/src/app

RUN gulp build

RUN npm prune --production

EXPOSE 8000

ENTRYPOINT ["nodemon", "--watch", "/config", "--exec"]

CMD [ "./scripts/start_web.sh"]
