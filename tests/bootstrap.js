process.env.NODE_HEAPDUMP_OPTIONS = 'nosignal';
require("babel/register")({
	optional: ['es7.objectRestSpread']
});
