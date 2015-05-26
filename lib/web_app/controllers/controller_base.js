'use strict';
import _ from 'lodash';
import logger from '@hoist/logger';

class BaseController {
	constructor() {
		this.routes = [];
		this.name = "BaseController";
		_.bindAll(this);
		this.logger = logger.child({
			cls: this.constructor.name
		});
		this.logger.info('bound logger');
		this.logger.alert = logger.alert;
	}
}


export default BaseController;
