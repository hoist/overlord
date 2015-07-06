FROM iojs:1.8

# add our user and group first to make sure their IDs get assigned consistently, regardless of whatever dependencies get added
RUN addgroup --gid 1001 hoist && adduser --system --uid 1003 --ingroup hoist --disabled-password hoist && usermod -a -G staff hoist && chown -R root:staff /usr/local/

#create and set the working directory
RUN mkdir -p /usr/src/app/coverage && mkdir /home/hoist/.npm

#copy npmrc to enable login to private npm
COPY .npmrc /home/hoist/.npmrc

#sort out permissions
RUN chown hoist:hoist /home/hoist/.npmrc && chown -R hoist:hoist /home/hoist/.npm && chown -R hoist:hoist /usr/src/app

#don't include .npm cache in final image
VOLUME /home/hoist/.npm

#switch to the hoist user
USER hoist

WORKDIR /usr/src/app

#only show warnings for npm
ENV NPM_CONFIG_LOGLEVEL=warn

#install global packages
RUN npm install mongoose-data-migrate -g && npm install -g nodemon && npm install -g gulp && npm install -g bson

#npm install
ADD package.json /usr/src/app/package.json
RUN npm install

#ensure migrations run from correct directory
ENV NODE_MONGOOSE_MIGRATIONS_CONFIG=./config/migrations.js

#ensure nodemon doesn't create heapdumps
ENV NODE_HEAPDUMP_OPTIONS=nosignal

#add source and ensure it's owned by the hoist user
USER root
ADD . /usr/src/app
RUN chown -R hoist:hoist /usr/src/app
USER hoist

#build any static content
RUN gulp build

#expose the web port
EXPOSE 8000

#start with nodemon monitoring the config directory
ENTRYPOINT ["nodemon", "--exitcrash", "--watch", "/config", "--exec"]

#start the web app
CMD [ "./scripts/start_web.sh"]
