FROM iojs:1.8

#create and set the working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

#don't include .npm cache in final image
VOLUME /root/.npm

#copy npmrc to enable login to private npm
COPY .npmrc /root/.npmrc


#only show warnings for npm
ENV NPM_CONFIG_LOGLEVEL=warn

#install global packages
RUN npm install mongoose-data-migrate -g && npm install -g nodemon && npm install -g gulp

#npm install
ADD package.json /usr/src/app/package.json
RUN npm install

#ensure migrations run from correct directory
ENV NODE_MONGOOSE_MIGRATIONS_CONFIG=./config/migrations.js

#ensure nodemon doesn't create heapdumps
ENV NODE_HEAPDUMP_OPTIONS=nosignal


#add source
ADD . /usr/src/app

#build any static content
RUN gulp build

#expose the web port
EXPOSE 8000

#start with nodemon monitoring the config directory
ENTRYPOINT ["nodemon", "--watch", "/config", "--exec"]

#start the web app
CMD [ "./scripts/start_web.sh"]
