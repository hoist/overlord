var config = require('config');
var migrationConfig = {
  schema: {
    'migration': {}
  },
  modelName: 'Migration',
  db: config.get('Hoist.mongo.overlord')
};
module.exports = {
  development: migrationConfig,
  docker:migrationConfig,
  test: migrationConfig,
  production: migrationConfig
};
