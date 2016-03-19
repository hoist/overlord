var config = require('config');

module.exports = {

    // The location of the the mongoose module. Since mongoose-data-migrate
    // needs to make a connection to mongodb, if you point to it here you'll
    // be able to use the same connection in your migration files rather than
    // creating your own connection.
    mongoose: '../node_modules/mongoose',

    // mongodb connection string in mongoose format: 'mongodb://username:password@host:port/database?options...'
    // See: http://mongoosejs.com/docs/connections.html
    db: config.get('Hoist.mongo.core.connectionString'),

    // Name for the migrations collection (defaults to 'migrations')
    collection: 'migrations'
};
