'use strict';
require('../config/migration_bootstrap');
var ConnectorSetting = require('@hoist/model').ConnectorSetting
var config = require('config');
var Bluebird = require('bluebird');
exports.up = function (next) {
  console.log('    --> This is migration 2015-09-15-1215-root-xero-connector.js being applied');
  var connectorSetting = new ConnectorSetting({
    application: 'mQqxktcK3Dx7DHa5tyON',
    environment: 'live',
    connectorType: 'hoist-connector-xero',
    settings: {
      authType: 'Partner',
      consumerKey: 'NXKZHFJYX3SFUHZ7RXKXLE0LTZPMM0',
      consumerSecret: '2TIE2ST6N1U54JZ8KHRDWONLW02SZM',
      privateKey: "-----BEGIN RSA PRIVATE KEY-----\nMIICWwIBAAKBgQC04iUShdS4wGhK+/ojgeTcs44Yv3PHZrQxemTlIfOtaT3dNycy\nBLIfFZKAApB5AH+so26GAxbZFk+9ZAGgyhsXZs3ngObzR8xi1mzSsSgqMF/ElP58\noi9f1v0VlPd+utr4SwZDQb9ikn9ns3guj7x9lBY5moZh1Athqo9ZB2Ef+QIDAQAB\nAoGAEjSAjrCxjDaxSHq73j8AjcX0k0ERogwQLrqm1Pjp0ZY6B725UCtw0fgV2pRn\nfgYy02lPgmVlM0wvklwyXcB5oWH6W91MfNxsp3RwfrVpFOrx1xNSajfoJxh8gdQM\nmz9KjTi7BkNsmkJP8/jwBEHYtr39vrlFQmubsM7iTmSchNECQQDfl3lD7JoTa+vz\nIxFHr9cPiF7NBD4Nkd/wy9IJWtdUW65wFqc6qP44LEmfrFGDPvEiokfFrhkbRYEK\nNlNuL6Q3AkEAzxny/ImOax6lG8ypHqZXoR9aZzOgI9CdNz79qcpSy6XE/irMDwyL\n08vPVU93IqchrzjEsXMTcFi5P9HA3dqlTwJABlCl6Sg2ldPXfy9/XnH19gdY/htf\nkUyMcaWgEgmRyV0piRrqsDpzq6x8i9j3GGjfsKW6tzeal+2Xnm04YAVScwJABnpn\nUWL0I4Gn5IC4YY8OeqnCaCwDPFuQL2Q3BxKfGGOtD85C582aqhtb9u0vatQTh6mc\n7XgOCZuc39Qt1kK6nQJAZbOxltygQcoIsh4dYD3tfmolHqUgC+nIW4Ly+tjn2PbG\n46tXv92ymsvNZfcIGoouNMZ6hz9iJTfCXJhluntRdw==\n-----END RSA PRIVATE KEY-----\n",
      publicKey: "-----BEGIN CERTIFICATE-----\nMIIDnzCCAwigAwIBAgIJAIjw7uZA8383MA0GCSqGSIb3DQEBBQUAMIGSMQswCQYD\nVQQGEwJOWjETMBEGA1UECBMKV2VsbGluZ3RvbjETMBEGA1UEBxMKV2VsbGluZ3Rv\nbjEXMBUGA1UEChMOSG9pc3QgQXBwcyBMdGQxGjAYBgNVBAMTEXd3dy5ob2lzdGFw\ncHMuY29tMSQwIgYJKoZIhvcNAQkBFhVzdXBwb3J0QGhvaXN0YXBwcy5jb20wHhcN\nMTQwODAxMDEzODEwWhcNMTkwNzMxMDEzODEwWjCBkjELMAkGA1UEBhMCTloxEzAR\nBgNVBAgTCldlbGxpbmd0b24xEzARBgNVBAcTCldlbGxpbmd0b24xFzAVBgNVBAoT\nDkhvaXN0IEFwcHMgTHRkMRowGAYDVQQDExF3d3cuaG9pc3RhcHBzLmNvbTEkMCIG\nCSqGSIb3DQEJARYVc3VwcG9ydEBob2lzdGFwcHMuY29tMIGfMA0GCSqGSIb3DQEB\nAQUAA4GNADCBiQKBgQC04iUShdS4wGhK+/ojgeTcs44Yv3PHZrQxemTlIfOtaT3d\nNycyBLIfFZKAApB5AH+so26GAxbZFk+9ZAGgyhsXZs3ngObzR8xi1mzSsSgqMF/E\nlP58oi9f1v0VlPd+utr4SwZDQb9ikn9ns3guj7x9lBY5moZh1Athqo9ZB2Ef+QID\nAQABo4H6MIH3MB0GA1UdDgQWBBRNnnXUvKes3j4fu75I4ULxIYNqsTCBxwYDVR0j\nBIG/MIG8gBRNnnXUvKes3j4fu75I4ULxIYNqsaGBmKSBlTCBkjELMAkGA1UEBhMC\nTloxEzARBgNVBAgTCldlbGxpbmd0b24xEzARBgNVBAcTCldlbGxpbmd0b24xFzAV\nBgNVBAoTDkhvaXN0IEFwcHMgTHRkMRowGAYDVQQDExF3d3cuaG9pc3RhcHBzLmNv\nbTEkMCIGCSqGSIb3DQEJARYVc3VwcG9ydEBob2lzdGFwcHMuY29tggkAiPDu5kDz\nfzcwDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQUFAAOBgQAd2s+ypmLCJTsDaU0b\npw3ScenSCz3j7O/ap3gITR4YLiFCzsCSZbE3buN+U3UnYQ90wtGa0ctxTEnbu9EX\nOen1I4pKj4plrfOvvc3X4OxwtkLhvMSgbvvKWG5MAqCChRUVvEzKEWMT3zXfYxST\nOVsG9Z+tKhQDUWAlWm1+1WgaDA==\n-----END CERTIFICATE-----\n",
      payroll: 'true'
    },
    name: "xero",
    key: "hoist-root-hoist-connector-xero",
  });
  var testConnectorSetting = new ConnectorSetting({
    application: 'docker-admin-app',
    environment: 'live',
    connectorType: 'hoist-connector-xero',
    settings: {
      authType: 'Public',
      consumerKey: 'IPCIWUPXMYYQC2CMHHIZI9TLRV7RAB',
      consumerSecret: 'EZXKAAYEPXV8JD5GBZQTKRMCIIONWT',
      payroll: 'true'
    },
    name: "xero",
    key: "hoist-root-hoist-connector-xero",
  });
  return Bluebird.all([
      connectorSetting.saveAsync(),
      testConnectorSetting.saveAsync()
    ])
    .then(function () {
      console.log('connector setting saved');
      next();
    }).catch(function (err) {
      console.warn(err.message);
      next(err);
    });
};

exports.down = function (next) {
  console.log('    --> This is migration 2015-09-15-1215-root-xero-connector.js being rollbacked');
  return Bluebird.all([
    ConnectorSetting.removeAsync({
      application: 'mQqxktcK3Dx7DHa5tyON',
      key: "hoist-root-hoist-connector-xero"
    }), ConnectorSetting.removeAsync({
      application: 'docker-admin-app',
      key: "hoist-root-hoist-connector-xero"
    })
  ]).then(function () {
    console.log('connector setting saved');
    next();
  }).catch(function (err) {
    console.warn(err.message);
    next(err);
  });
};
