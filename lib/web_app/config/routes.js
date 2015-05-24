'use strict';
var BBPromise = require('bluebird');
var glob = BBPromise.promisify(require('glob'));
var logger = require('@hoist/logger');
var path = require('path');
var _ = require('lodash');
var fs = BBPromise.promisifyAll(require('fs'));
var browserify = require("browserify");
var babelify = require("babelify");
var mkdirp = BBPromise.promisify(require('mkdirp'));
var streamToPromise = require('stream-to-promise');
var moment = require('moment');
var config = require('config');

module.exports = function (server) {

  return glob(path.resolve(__dirname, '../controllers/*_controller.js'))
    .then(function (files) {
      logger.info('controllers files', files);
      files.forEach(function (file) {
        logger.info('file', file);
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
        path: '/routes',
        config: {
          handler: function (req, reply) {
            var routeTable = req.server.table();
            return reply(routeTable[0].table.map(function (route) {
              console.log({
                path: route.path,
                settings: route.settings
              });
            }));
          }
        }
      }, {
        method: 'GET',
        path: '/css/{param*}',
        handler: {
          directory: {
            path: path.resolve(__dirname, '../assets/compiled/css'),
            lookupCompressed: true
          }
        }
      }, {
        method: 'GET',
        path: '/templates/{path*}',
        handler: function (request, reply) {
          var filePath;
          return BBPromise.try(function () {
                logger.info('requesting template');
                filePath = path.resolve(__dirname, '../assets/compiled/js/templates', request.params.path + '.js');
                var sourcePath = path.resolve(__dirname, '../views/', request.params.path + '.jsx');
                logger.info({
                  filePath: filePath,
                  sourcePath: sourcePath
                }, 'template path');

                function compileTemplate() {
                  return mkdirp(path.dirname(filePath))
                    .then(function () {
                      logger.info('creating file');
                      return streamToPromise(browserify({
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
                        .bundle()
                        .pipe(fs.createWriteStream(filePath)));

                    });
                }
                if (config.get('Hoist.debug') || (!fs.existsSync(filePath) && fs.existsSync(sourcePath))) {
                  return compileTemplate();

                } else {
                  //check if we've modified the file
                  return BBPromise.all([
                    fs.statAsync(filePath),
                    fs.statAsync(sourcePath)
                  ]).spread(function (targetStats, sourceStats) {
                    var targetDate = moment(targetStats.mtime);
                    var sourceDate = moment(sourceStats.mtime);
                    if (targetDate.isBefore(sourceDate)) {
                      logger.info('recompiling template');
                      return compileTemplate();
                    }
                  });
                }


              }, [],
              this)
            .bind(this)
            .then(function () {
              logger.info('serving file');
              reply.file(filePath, {
                lookupCompressed: true
              });
            });

        }
      }, {
        method: 'GET',
        path: '/js/{param*}',
        handler: {
          directory: {
            path: path.resolve(__dirname, '../assets/compiled/js'),
            lookupCompressed: true
          }
        }
      }, {
        method: 'GET',
        path: '/img/{param*}',
        handler: {
          directory: {
            path: path.resolve(__dirname, '../assets/compiled/img'),
            lookupCompressed: true
          }
        }
      }]);
    });
};
