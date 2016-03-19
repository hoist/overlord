'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMessages = getMessages;

var _rabbit = require('../utils/rabbit');

var RabbitUtils = _interopRequireWildcard(_rabbit);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function getMessages(application, token) {
  var queueName = 'application-console-log-' + application._id + '-' + token;
  return Promise.resolve().then(function () {
    return RabbitUtils.setupQueue({
      queue: {
        name: queueName,
        properties: {
          exclusive: false,
          durable: true,
          autoDelete: false,
          expires: 600000
        }
      },
      exchange: {
        name: 'application-log-messages',
        type: 'topic',
        routingKey: 'log.' + application._id + '.#'
      }
    });
  }).then(function () {
    return RabbitUtils.getMessages(queueName);
  });
}
//# sourceMappingURL=../../maps/server/logic/console.js.map
