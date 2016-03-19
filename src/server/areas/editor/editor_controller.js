import {
  BaseController
} from '../base_controller';
import {
  ConnectorLogic,
  EditorLogic,
  EventLogic
} from '../../logic';
import {
  uniq,
  flatten
} from 'lodash';
import errors from '@hoist/errors';
/**
 * Controller for user actions related their Organisations
 * @extends {BaseController}
 */
export class EditorController extends BaseController {
  /**
   * create a new OrganistionController
   */
  constructor() {
    super();
  }

  /**
   * gets state data to populate the editor
   * @param {HapiRequest} request - the login HTTP request
   * @param {HapiReply} reply - the reply to send to the user
   * @return {Promise}
   */
  state(request, reply) {
    let data = {};
    return Promise.resolve()
      .then(() => {
        if (request.auth.credentials.application) {
          return ConnectorLogic.getConnectorsForApplication(request.auth.credentials.application)
        } else {
          return [];
        }
      })
      .then((connectors) => {
        data.connectors = connectors;
        if (connectors.length > 0 && connectors[0].events.length > 0) {
          return EditorLogic.getCodeForEvent(request.auth.credentials.application, connectors[0].events[0])
            .then((code) => {
              if (code) {
                return code;
              } else {
                return connectors[0].codeForEvent(connectors[0].events[0])
                  .then((code) => {
                    if (!code) {
                      return "";
                    } else {
                      return code;
                    }
                  });
              }
            })
            .then((code) => {
              this
                ._logger
                .info({
                  codeLength: code.length
                }, 'got code for event');
              data.code = {
                event: connectors[0].events[0].key,
                script: code
              }
            })
        }
      })
      .then(() => {
        let events = flatten(data.connectors.map((c) => c.events));
        return EventLogic.getEvents(request.auth.credentials.application.settings)
          .then((applicationEvents) => {
            events = events.concat(applicationEvents);
            data.events = uniq(events, (ev) => ev.key);
          });
      })
      .then(() => {
        reply(data);
      });
  }
  script(request, reply) {
    return Promise.resolve()
      .then(() => {
        let key = request.params.event;
        let eventParts = key.split(":");
        let connectorKey = eventParts[0];
        let eventName = eventParts.slice((eventParts.length - 1) * -1)
          .join(":");
        if (connectorKey.length < 0) {
          key = eventName;
        }
        return EditorLogic.getCodeForEvent(request.auth.credentials.application, {
            key: key
          })
          .then((module) => {
            if (!module && connectorKey && connectorKey.length > 0) {
              return ConnectorLogic.loadConnector(request.auth.credentials.application._id, connectorKey)
                .then((connector) => {
                  if (connector) {
                    return connector.codeForEvent({
                      name: eventName
                    });
                  }
                })
            }
            return module;
          })
          .then((code) => {
            return code || "";
          })
          .then((code) => {
            reply({
              event: key,
              script: code
            });
          });
      });
  }

  saveScript(request, reply) {
    return Promise.resolve()
      .then(() => {
        let script = request.payload.code;
        let eventName = request.params.eventName;
        let application = request.auth.credentials.application;
        let organisation = request.auth.credentials.organisation;
        return EditorLogic.saveScript({
          eventName,
          application,
          organisation,
          script
        });
      })
      .then(() => {
        reply({
          ok: true
        });
      })
  }

  /**
   * @override
   * @returns {Array<Object>} - an array of route configurations @see http://hapijs.com/api#route-configuration
   */
  routes() {
    return [
      {
        method: 'GET',
        path: '/editor/state',
        config: {
          handler: this.state,
          auth: {
            strategy: 'session'
          }
        }
      }, {
        method: 'GET',
        path: '/editor/script/{event}',
        config: {
          handler: this.script,
          auth: {
            strategy: 'session'
          }
        }
      }, {
        method: 'POST',
        path: '/editor/script/{eventName}',
        config: {
          handler: this.saveScript,
          auth: {
            strategy: 'session'
          }
        }
      }
    ]
  }
}
export default EditorController;
