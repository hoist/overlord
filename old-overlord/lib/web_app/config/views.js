'use strict';
var viewEngine = require('../engines/react_view_engine');
var BBPromise = require('bluebird');
var path = require('path');
var config = require('config');

module.exports = function (server) {

  return BBPromise.try(function () {
    server.views({
      defaultExtension: 'jsx',
      engines: {
        jsx: viewEngine, // support for .jsx files
        js: viewEngine // support for .js
      },
      compileOptions: {
        layoutRoot: path.resolve(__dirname, config.get('Hoist.debug') ? '../views/_layouts' : '../assets/compiled/_layouts'),
        layout: 'default.hbs'
      },
      isCached: false,
      relativeTo: path.resolve(__dirname, '../'),
      path: 'views'
    });
    server.ext('onPreResponse', function assetPipeHook(request, reply) {
      var response = request.response;
      if (response.variety === 'view') {
        var context = response.source.context;
        context.template = response.source.template;
        context.controller = request.pre.controller;
        if (request.auth.isAuthenticated) {
          context.authenticated = true;
          context.user = request.auth.credentials.name;
        }
      }
      return reply(request.response);
    });
    return server;
  });
};
