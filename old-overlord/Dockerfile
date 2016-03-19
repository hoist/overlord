FROM hoist/core-box:1.8

USER root
#copy npmrc to enable login to private npm
COPY .npmrc /home/hoist/.npmrc

RUN chown hoist:hoist /home/hoist/.npmrc

USER hoist

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
