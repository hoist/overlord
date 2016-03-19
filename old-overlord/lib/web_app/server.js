'use strict';
import Hapi from 'hapi';
import logger from '@hoist/logger';

export default () => {
  const server = new Hapi.Server();
  logger.info('core config');
  return require('./config/core')(server)
    .then(() => {
      logger.info('authentication config');
      return require('./config/authentication')(server);
    })
    .then(() => {
      logger.info('view config');
      return require('./config/views')(server);
    }).then(() => {
      logger.info('route config');
      return require('./config/routes')(server);
    }).then(() => {
      logger.info('info', server.info);
      return server;
    }).catch((err) => {
      console.warn(err, err.stack);
    });
};
