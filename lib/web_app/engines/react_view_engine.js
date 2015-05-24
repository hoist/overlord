'use strict';
import Transmit from "react-transmit";
import Handlebars from "handlebars";
import Path from "path";
import logger from '@hoist/logger';
import fs from "fs";
import _ from "lodash";

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
								reactData = _.extend(reactData, context);
								logger.info({
									reactString: reactString
								}, 'injecting');
								logger.info('rendering layout');
								context.content = reactString;
								var markup = template(context);
								logger.info({
									markup: markup
								}, 'injecting');
								markup = Transmit.injectIntoMarkup(markup, reactData, ['/templates/' + context.template, '/js/client.js']);
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
