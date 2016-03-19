'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setupQueue = setupQueue;
exports.getMessages = getMessages;
exports.closeConnection = closeConnection;

var _amqplib = require('amqplib');

var _amqplib2 = _interopRequireDefault(_amqplib);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _logger2 = require('@hoist/logger');

var _logger3 = _interopRequireDefault(_logger2);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _logger = _logger3.default.child({ cls: 'RabbitUtils' });

var _connection = _amqplib2.default.connect(_config2.default.get('Hoist.rabbit.url')).then(function (connection) {
  connection.on('close', function () {
    open = null;
  });
  connection.on('error', function (err) {
    _logger.error(err);
    _logger.alert(err);
  });
  return connection;
});

function connect() {
  if (!_connection) {
    _connection = _amqplib2.default.connect(_config2.default.get('Hoist.rabbit.url')).then(function (connection) {
      connection.on('close', function () {
        _connection = null;
      });
      connection.on('error', function (err) {
        _logger.error(err);
        _logger.alert(err);
      });
      return connection;
    });
  }
  return _connection;
}

function setupQueue(_ref) {
  var queue = _ref.queue;
  var exchange = _ref.exchange;

  return connect().then(function (connection) {
    _logger.info('creating channel');
    return connection.createChannel();
  }).then(function (channel) {
    var _err = undefined;
    _logger.info('asserting queue');
    return channel.assertQueue(queue.name, queue.properties).then(function (queueDetails) {
      if (exchange) {
        _logger.info('asserting exchange');
        return channel.assertExchange(exchange.name, exchange.type).then(function () {
          _logger.info('binding queue to exchange');
          return channel.bindQueue(queueDetails.queue, exchange.name, exchange.routingKey);
        });
      }
    }).catch(function (err) {
      _logger.info('saving error for later');
      _err = err;
    }).then(function () {
      _logger.info('closing channel');
      return channel.close();
    }).then(function () {
      if (_err) {
        _logger.info('rethrowing error');
        throw _err;
      }
    });
  });
}

function _getMany(channel, queue) {
  var max = arguments.length <= 2 || arguments[2] === undefined ? 10 : arguments[2];
  var current = arguments.length <= 3 || arguments[3] === undefined ? [] : arguments[3];

  _logger.info({
    current: current
  }, 'getting messages');
  if (current.length > max) {
    return current;
  } else {
    return channel.get(queue, { noAck: true }).then(function (message) {
      if (!message) {
        return current;
      } else {
        var content = JSON.parse(message.content.toString());
        _logger.info({
          content: content
        }, 'got a rabbit message');
        return _getMany(channel, queue, max, current.concat(formatLogEntry(content)));
      }
    });
  }
}

function formatLogEntry(eventLog) {
  return {
    id: eventLog._id,
    type: eventLog.type || 'log',
    message: eventLog.message,
    time: (0, _moment2.default)(eventLog.createdAt).format('HH:mm:ss'),
    stack: eventLog.errorStack
  };
}
function getMessages(queue, max) {
  return connect().then(function (connection) {
    _logger.info('creating channel');
    return connection.createChannel();
  }).then(function (channel) {
    var _err = undefined;
    channel.prefetch(max);
    return _getMany(channel, queue, max, []).catch(function (err) {
      _logger.info('saving error for later');
      _err = err;
    }).then(function (messages) {
      _logger.info('closing channel');
      return channel.close().then(function () {
        return messages;
      });
    }).then(function (messages) {
      if (_err) {
        _logger.info('rethrowing error');
        throw _err;
      }
      return messages;
    });
  }).then(function (messages) {
    _logger.info({
      messages: messages
    }, 'returning messages');
    return messages || [];
  });
}
function closeConnection() {
  if (_connection) {
    return connect().then(function (connection) {
      return connection.close();
    });
  }
}
//# sourceMappingURL=../../maps/server/utils/rabbit.js.map
