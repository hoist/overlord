'use strict';
var reactEngine = require('hapijs-react-views')({
  caching: false
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
    return server;
  });
};
