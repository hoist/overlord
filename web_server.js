var server = require('./lib/web_app/server');


server.start();
process.on('SIGTERM', server.stop);
process.on('SIGINT', server.stop);
