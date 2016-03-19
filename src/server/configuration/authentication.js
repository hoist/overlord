import {BaseConfigurator} from './base_configurator';
import config from 'config';
import HapiAuthCookie from 'hapi-auth-cookie';
import {Session} from '@hoist/model';
/* istanbul ignore next */
export class AuthenticationConfigurator extends BaseConfigurator {
  configure (hapiServer) {
    return Promise
      .resolve()
      .then(() => {
        return hapiServer.registerAsync(HapiAuthCookie)
      })
      .then(() => {
        return hapiServer
          .auth
          .strategy('session', 'cookie', {
            password: config.get('Hoist.cookies.beta.password'),
            cookie: config.get('Hoist.cookies.beta.name'),
            redirectTo: '/session/create',
            isSecure: config.get('Hoist.cookies.beta.secure'),
            validateFunc: (request, session, callback) => {
              return Promise
                .resolve(Session.findOne({_id: session._id, isValid: true}).populate({path: 'organisation'}).populate({path: 'user'}).populate({path: 'application'}).exec())
                .then((loadedSession) => {
                  callback(null, !!(loadedSession), loadedSession);
                })
                .catch((err) => {
                  callback(err);
                });
            }
          });
      })
  }
}
