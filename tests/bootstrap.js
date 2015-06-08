process.env.NODE_HEAPDUMP_OPTIONS = 'nosignal';
process.env.NODE_ENV = 'test';
var chai = require('chai');
chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));
