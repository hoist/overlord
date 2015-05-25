'use strict';
import {}
from '../../bootstrap';
import configureServer from '../../../lib/web_app/server';
import {
	expect
}
from 'chai';
describe('route_table', () => {
	before(() => {
		return configureServer();
	});
	it('routes /js to file system', function () {
		return configureServer().then(function (server) {
			return server.match('get', '/js/some_file.js');
		}).then(function (route) {
			expect(route.path).to.eql('/js/{param*}');
		});
	});
	it('routes /img to file system', function () {
		return configureServer().then(function (server) {
			return server.match('get', '/img/some_file.js');
		}).then(function (route) {
			expect(route.path).to.eql('/img/{param*}');
		});
	});
});
