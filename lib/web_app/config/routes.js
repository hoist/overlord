'use strict';
var BBPromise = require('bluebird');
var glob = BBPromise.promisify(require('glob'));
var logger = require('@hoist/logger');
var path = require('path');
var _ = require('lodash');
var config = require('config');
var browserify = require("browserify");
var babelify = require("babelify");
var through = require('through2');

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
          let originalHandler = route.config.handler || route.handler;
          delete route.handler;
          route.config.handler = function (request, reply) {
            //always catch errors
            Promise.resolve(originalHandler.apply(controller, arguments))
              .catch((err) => {
                controller.onError(request, reply, err);
              });
          };
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
      if (config.get('Hoist.debug')) {
        server.route({
          method: 'GET',
          path: '/js/templates/{path*}',
          handler: function (request, reply) {
            //this serves up the react view dynamically
            return BBPromise.try(function () {
              logger.info('requesting template');
              var sourcePath = path.resolve(__dirname, '../views/', request.params.path + 'x');
              logger.info({
                sourcePath: sourcePath
              }, 'template path');
              logger.info('creating file');
              var stream = through();
              var b = browserify({
                  debug: true
                })
                .transform(babelify.configure({
                  optional: ["es7.objectRestSpread"]
                }))
                .require(sourcePath, {
                  expose: 'view'
                })
                .require('react', {
                  expose: 'react'
                })
                .require('react-transmit', {
                  expose: 'react-transmit'
                })
                .add(path.resolve(__dirname, '../assets/src/javascript/client.js'));
              b.bundle().pipe(stream);
              reply(stream);
            }, [], this);
          }
        });
      }
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
