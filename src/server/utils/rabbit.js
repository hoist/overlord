import amqp from 'amqplib';
import config from 'config';
import logger from '@hoist/logger';
import moment from 'moment';
const _logger = logger.child({cls: 'RabbitUtils'});

let _connection = amqp
  .connect(config.get('Hoist.rabbit.url'))
  .then((connection) => {
    connection.on('close', () => {
      open = null;
    });
    connection.on('error', (err) => {
      _logger.error(err);
      _logger.alert(err);
    });
    return connection;
  });

function connect() {
  if (!_connection) {
    _connection = amqp
      .connect(config.get('Hoist.rabbit.url'))
      .then((connection) => {
        connection.on('close', () => {
          _connection = null;
        });
        connection.on('error', (err) => {
          _logger.error(err);
          _logger.alert(err);
        });
        return connection;
      });
  }
  return _connection;
}

export function setupQueue({queue, exchange}) {
  return connect().then((connection) => {
    _logger.info('creating channel');
    return connection.createChannel()
  }).then((channel) => {
    let _err;
    _logger.info('asserting queue');
    return channel
      .assertQueue(queue.name, queue.properties)
      .then((queueDetails) => {
        if (exchange) {
          _logger.info('asserting exchange');
          return channel
            .assertExchange(exchange.name, exchange.type)
            .then(() => {
              _logger.info('binding queue to exchange');
              return channel.bindQueue(queueDetails.queue, exchange.name, exchange.routingKey);
            })
        }
      })
      .catch((err) => {
        _logger.info('saving error for later');
        _err = err;
      })
      .then(() => {
        _logger.info('closing channel');
        return channel.close();
      })
      .then(() => {
        if (_err) {
          _logger.info('rethrowing error');
          throw _err;
        }
      });
  });
}

function _getMany(channel, queue, max = 10, current = []) {
  _logger.info({
    current
  }, 'getting messages');
  if (current.length > max) {
    return current;
  } else {
    return channel
      .get(queue, {noAck: true})
      .then((message) => {
        if (!message) {
          return current;
        } else {
          let content = JSON.parse(message.content.toString());
          _logger.info({
            content
          }, 'got a rabbit message');
          return _getMany(channel, queue, max, current.concat(formatLogEntry(content)));
        }
      })
  }
}

function formatLogEntry(eventLog) {
  return {
    id: eventLog._id,
    type: eventLog.type || 'log',
    message: eventLog.message,
    time: moment(eventLog.createdAt).format('HH:mm:ss'),
    stack: eventLog.errorStack
  }
}
export function getMessages(queue, max) {
  return connect().then((connection) => {
    _logger.info('creating channel');
    return connection.createChannel()
  }).then((channel) => {
    let _err;
    channel.prefetch(max);
    return _getMany(channel, queue, max, []).catch((err) => {
      _logger.info('saving error for later');
      _err = err;
    }).then((messages) => {
      _logger.info('closing channel');
      return channel
        .close()
        .then(() => messages);
    }).then((messages) => {
      if (_err) {
        _logger.info('rethrowing error');
        throw _err;
      }
      return messages;
    });
  }).then((messages) => {
    _logger.info({
      messages: messages
    }, 'returning messages');
    return messages || [];
  });
}
export function closeConnection() {
  if (_connection) {
    return connect().then((connection) => {
      return connection.close();
    });
  }
}
