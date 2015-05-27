'use strict';
import Transmit from "react-transmit";
import Handlebars from "handlebars";
import Path from "path";
import logger from '@hoist/logger';
import fs from "fs";
import _ from "lodash";
import System from 'systemjs';
import config from 'config';


let manifest = {};
if (!config.get('Hoist.debug')) {
	System.map.json = 'system-plugins/json';
	logger.info('loading manifest');
	System.import('lib/web_app/rev-manifest.json!').then((m) => {
		logger.debug({
			manifest: m
		}, 'loaded manifest');
		manifest = m;
	}, (err) => {
		logger.error(err);
	});
}
module.exports = {
	module: {
		compile: (reactContent, compileOptions, callback) => {
			logger.info('compiling layout');
			fs.readFile(Path.resolve(compileOptions.layoutRoot, compileOptions.layout), {
				encoding: 'utf8'
			}, (err, content) => {
				if (err) {
					logger.error(err);
					throw err;
				}
				var template = Handlebars.compile(content);
				logger.info('requiring view');
				var Handler = require(compileOptions.filename);
				process.nextTick(() => {
					callback(null, (context, viewOptions, rendered) => {
						logger.info('rendering view');
						Transmit.renderToString(Handler, context)
							.then(({
								reactString, reactData
							}) => {
								var templatePath = 'js/templates/' + context.template + '.js';

								if (manifest[templatePath]) {
									templatePath = manifest[templatePath];
								}

								reactData = _.extend(reactData, context);
								logger.debug({
									reactString: reactString
								}, 'injecting');
								logger.info('rendering layout');
								context.content = reactString;
								var markup = template(context);
								logger.debug({
									markup: markup
								}, 'injecting');
								markup = Transmit.injectIntoMarkup(markup, reactData, ['/' + templatePath]);
								logger.info('returning');
								rendered(null, markup);
							});
					});
				});
			});

		}
	},

	compileMode: 'async'
};
