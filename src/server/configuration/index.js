'use strict';
import {RouteConfigurator} from './routes';
import {ServerConfigurator} from './server';
import {AuthenticationConfigurator} from './authentication';
import {LoggingConfigurator} from './logging';
export default {
  routes: new RouteConfigurator(),
  server: new ServerConfigurator(),
  auth: new AuthenticationConfigurator(),
  logging: new LoggingConfigurator()
}
