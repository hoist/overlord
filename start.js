'use strict';
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}
console.log("environment", process.env.NODE_ENV);
require('source-map-support/register');
var config = require('config');

function start() {
  var Server;
  if (!config.get('Hoist.webpack.optimize')) {
    require('babel-register');
    if (!require('piping')({hook: true, ignore: /(components|containers|modules)/})) {
      return;
    }
    Server = require('./src/server').default;
  } else {
    Server = require('./lib/server').default;
  }

  var logger = require('@hoist/logger');
  var server = new Server();
  server.start();
}

start();
