'use strict';
var reactEngine = require('hapijs-react-views')({
  caching: false,
  jsx: {
    harmony: true
  }
});
var BBPromise = require('bluebird');
var path = require('path');

module.exports = function (server) {

  return BBPromise.try(function () {
    server.views({
      defaultExtension: 'jsx',
      engines: {
        jsx: reactEngine, // support for .jsx files
        js: reactEngine // support for .js
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
