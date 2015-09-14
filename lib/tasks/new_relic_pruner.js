'use strict';
import logger from '@hoist/logger';
import request from 'request-promise';
import moment from 'moment';
import {
  filter
}
from 'lodash';
import config from 'config';

class NewRelicPruner {
  constructor() {
    this._logger = logger.child({
      cls: this.constructor.name
    });
  }
  deleteServer(server) {
    let options = {
      method: 'DELETE',
      uri: 'https://api.newrelic.com/v2/servers/' + server.id,
      headers: {
        'X-Api-Key': config.get('Hoist.newrelic.apikey')
      },
      json: true
    };
    return request(options).then((response) => {
      this._logger.info({
        server, response
      }, 'server deleted');
    });
  }
  getServers() {
    var options = {
      method: 'GET',
      uri: 'https://api.newrelic.com/v2/servers/',
      headers: {
        'X-Api-Key': config.get('Hoist.newrelic.apikey')
      },
      json: true
    };
    return request(options).then((result) => {
      return result.servers;
    });
  }
  filterServers(servers) {
    let nameFilter = /-3-[0-9]{1,3}\.hoist\.internal$/;
    return filter(servers, (candidate) => {
      /*jshint camelcase:false */
      var lastReported = moment(candidate.last_reported_at);
      var dur = moment.duration(lastReported - moment());
      return (nameFilter.test(candidate.name) && ((!candidate.reporting) || dur.asMinutes() < -5));
    });
  }
  start() {
    return this.getServers().then((servers) => {
      this._logger.info({
        serverCount: servers.length
      }, 'got servers from new relic');
      return this.filterServers(servers);
    }).then((servers) => {
      this._logger.info({
        serverCount: servers.length
      }, 'flitered servers');
      return Promise.all(servers.map((s) => {
        return this.deleteServer(s);
      }));
    }).then(() => {
      this._logger.info('servers deleted');
    });
  }
}

let pruner = new NewRelicPruner();
pruner.start().then(() => {
  process.exit(0);
});
