process.env.NODE_HEAPDUMP_OPTIONS = 'nosignal';
require("babel/register")({
	optional: ['es7.objectRestSpread']
});

var chai = require('chai');
chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));
