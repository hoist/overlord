'use strict';
var configureServer = require('./lib/web_app/server');


configureServer().then(function (server) {
  server.start();
  process.on('SIGTERM', function () {
    server.stop();
  });
  process.on('SIGINT', function () {
    server.stop();
  });
});
