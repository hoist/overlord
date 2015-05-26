'use strict';
var BBPromise = require('bluebird');
var glob = BBPromise.promisify(require('glob'));
var logger = require('@hoist/logger');
var path = require('path');
var _ = require('lodash');

module.exports = function (server) {

  return glob(path.resolve(__dirname, '../controllers/*_controller.js'))
    .then(function (files) {
      logger.debug({
        files: files
      }, 'loaded controllers files');
      files.forEach(function (file) {
        logger.debug('file', file);
        var Controller = require(file);
        var controller = new Controller();
        server.route(_.map(controller.routes, function (route) {
          route.config = route.config || {};
          route.config.bind = controller;
          route.config.pre = [{
            method: function (request, reply) {
              reply(controller.name);
            },
            assign: "controller"
          }];
          return route;
        }));
      });
    }).then(function () {
      server.route([{
        method: 'GET',
        path: '/css/{param*}',
        config: {
          handler: {
            directory: {
              path: path.resolve(__dirname, '../assets/compiled/css'),
              lookupCompressed: true
            }
          },
          cache: {
            privacy: 'public',
            expiresIn: 365 * 24 * 60 * 60 * 1000 //one year
          }
        }
      }, {
        method: 'GET',
        path: '/js/{param*}',
        config: {
          handler: {
            directory: {
              path: path.resolve(__dirname, '../assets/compiled/js'),
              lookupCompressed: true
            }
          },
          cache: {
            privacy: 'public',
            expiresIn: 365 * 24 * 60 * 60 * 1000 //one year
          }
        }
      }, {
        method: 'GET',
        path: '/img/{param*}',
        config: {
          handler: {
            directory: {
              path: path.resolve(__dirname, '../assets/compiled/img'),
              lookupCompressed: true
            }
          },
          cache: {
            privacy: 'public',
            expiresIn: 365 * 24 * 60 * 60 * 1000 //one year
          }
        }
      }]);
    });
};
