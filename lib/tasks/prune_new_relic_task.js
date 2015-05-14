'use strict';

var request = require('request-promise');
var moment = require('moment');
var _ = require('lodash');
var BBPromise = require('bluebird');
var config = require('config');

function deleteServer(server) {
  var options = {
    method: 'DELETE',
    uri: 'https://api.newrelic.com/v2/servers/' + server.id,
    headers: {
      'X-Api-Key': config.get('Hoist.newrelic.apikey')
    },
    json: true
  };
  return request(options).then(function (response) {
    console.log(response);
  });
}

function removeServersFromNewRelic() {

  var options = {
    method: 'GET',
    uri: 'https://api.newrelic.com/v2/servers/',
    headers: {
      'X-Api-Key': config.get('Hoist.newrelic.apikey')
    },
    json: true
  };
  return request(options).then(function (result) {
    console.log(result.servers.length);
    var candidates = _.filter(result.servers, function (candidate) {
      /*jshint camelcase:false */
      var lastReported = moment(candidate.last_reported_at);
      var dur = moment.duration(lastReported - moment());
      //console.log(dur.minutes());
      return ((!candidate.reporting) || dur.asMinutes() < -5);
    });
    if (candidates.length > 0) {
      return BBPromise.all(_.map(candidates, deleteServer)).then(function () {
        return removeServersFromNewRelic();
      });
    }

  });

}

module.exports = removeServersFromNewRelic;
