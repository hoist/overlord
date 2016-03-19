var root = process.cwd();
var path = require('path');
module.exports = {
	js: {
		lib: [root + '/lib/**/*.js', '!' + root + '/lib/web_app/assets/**/*.js'],
		gulpfile: ['Gulpfile.js'],
		specs: ['tests/**/*.js', '!tests/fixtures/**/*']
	},
	jsx: {
		views: ['lib/web_app/views/**/*.jsx', '!lib/web_app/views/**/*components/*.jsx']
	},
	web: {
		views: ['lib/web_app/views/**/*.jsx'],
		assets: {
			raw: {
				all: ['lib/web_app/assets/src'],
				scss: ['lib/web_app/assets/src/scss/**/*.scss'],
				images: ['lib/web_app/assets/src/img/**/*']
			},
			compiled: ['lib/web_app/assets/compiled/**/*']
		},
		js: {
			all: ['lib/web_app/**/*.js'],
			server: ['lib/web_app/**/*.js', '!lib/web_app/assets/**/*.js']
		}
	},
	specs: ['tests/**/*.js', '!tests/fixtures/**/*']
};
