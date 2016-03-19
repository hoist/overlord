import * as RabbitUtils from '../utils/rabbit';
export function getMessages(application, token) {
  let queueName = `application-console-log-${application._id}-${token}`;
  return Promise
    .resolve()
    .then(() => {
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
          routingKey: `log.${application._id}.#`
        }
      })
    })
    .then(() => {
      return RabbitUtils.getMessages(queueName);
    });
}
