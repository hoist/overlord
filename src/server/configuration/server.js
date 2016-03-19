'use strict';
import {BaseConfigurator} from './base_configurator';
import config from 'config';
import vision from 'vision';
//import WebpackConfig from '../../../config/webpack/webpack.config';
import handlebars from 'handlebars';
import path from 'path';
import inert from 'inert';
//const compiler = Webpack(WebpackConfig);
/* istanbul ignore next */
export class ServerConfigurator extends BaseConfigurator {
  constructor () {
    super();
  }
  configure (hapiServer) {
    return Promise
      .resolve()
      .then(() => this._configureMainConnection(hapiServer))
      .then(() => this._configureWebpack(hapiServer))
      .then(() => this._configureViewEngine(hapiServer))
  }

  _configureMainConnection (hapiServer) {
    return hapiServer.connection({host: '0.0.0.0', port: 8000});
  }
  _configureWebpack (hapiServer) {
    if (!config.get('Hoist.webpack.optimize')) {
      let Webpack = require('webpack');
      let webpackConfig = require('../../../config/webpack/webpack.config');
      let compiler = Webpack(webpackConfig);
      return hapiServer.registerAsync({
        register: require('hapi-webpack-plugin'),
        options: {
          compiler: compiler,
          hot: {},
          assets: webpackConfig.assets
        }
      });
      // Do "hot-reloading" of react stuff on the server
      // Throw away the cached client modules and let them be re-required next time
      compiler.plugin('done', function () {
        Object
          .keys(require.cache)
          .forEach(function (id) {
            if (/\/client\//.test(id))
              delete require.cache[id];
            }
          );
      });
    }
  }
  _configureViewEngine (hapiServer) {
    return hapiServer
      .registerAsync(vision)
      .then(() => {
        handlebars.registerHelper('json', JSON.stringify);
        return hapiServer.views({
          engines: {
            hbs: handlebars
          },
          isCached: false,
          relativeTo: path.resolve(__dirname, '../'),
          path: 'views'
        })
      })
      .then(() => hapiServer.registerAsync(inert));
  }
}
