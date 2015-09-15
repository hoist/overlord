'use strict';
import mongoose from 'mongoose';
import config from 'config';
import logger from '@hoist/logger';
import Bluebird from 'bluebird';
import connectionManager from './models/connection_manager';

Bluebird.promisifyAll(mongoose);
mongoose.set('debug', true);
module.exports = {
  connect: function () {
    logger.info('connecting overlord connection and core connection');
    return Promise.all([mongoose.connectAsync(config.get('Hoist.mongo.core.connectionString')), connectionManager.connect(config.get('Hoist.mongo.overlord'))])
      .catch(function (err) {
        logger.error(err);
        process.exit(1);
      });
  },
  disconnect: function () {
    logger.info('disconnecting core connection');
    return mongoose.disconnectAsync().then(function () {
      logger.info('disconnecting overlord connection');
      return connectionManager.disconnect();
    }).then(() => {
      logger.info('disconnected');
    });
  }
};
