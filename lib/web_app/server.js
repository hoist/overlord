var Hapi = require('hapi');

var server = new Hapi.Server();

require('./config/core')(server);
require('./config/views')(server);
require('./config/routes')(server);


module.exports = server;
