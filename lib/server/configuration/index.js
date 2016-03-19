'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _routes = require('./routes');

var _server = require('./server');

var _authentication = require('./authentication');

var _logging = require('./logging');

exports.default = {
  routes: new _routes.RouteConfigurator(),
  server: new _server.ServerConfigurator(),
  auth: new _authentication.AuthenticationConfigurator(),
  logging: new _logging.LoggingConfigurator()
};
//# sourceMappingURL=../../maps/server/configuration/index.js.map
