'use strict';
import configureServer from '../../../../lib/web_app/server';
import connectionManager from '../../../../lib/models/connection_manager';
import Bluebird from 'bluebird';
import config from 'config';
import {
	ServerHelper
}
from '../../../fixtures/helpers';
import cheerio from 'cheerio';
import {
	expect
}
from 'chai';


describe('session', () => {
	let server;
	let serverHelper;
	before(() => {
		return Promise.all([
			connectionManager.connect(config.get('Hoist.mongo.overlord')),
			configureServer().then((s) => {
				server = Bluebird.promisifyAll(s);
				serverHelper = new ServerHelper(server);
			}).then(() => {
				return serverHelper.setupTestUser();
			})
		]);
	});
	after(() => {
		return Bluebird.promisify(connectionManager.connection.db.dropDatabase, connectionManager.connection.db)()
			.then(() => {
				return connectionManager.disconnect();
			});
	});
	describe('GET /session/create', () => {
		describe('if not logged in', () => {
			let response;
			let $;
			before(() => {
				return new Promise((resolve) => {
					server.inject({
						method: 'GET',
						url: `/session/create`
					}, (res) => {
						resolve(res);
					});
				}).then((res) => {
					response = res;
					$ = cheerio.load(response.payload);
				});
			});
			it('returns login page', () => {
				return expect($('title').text()).to.eql('Log In');
			});
		});
		describe('if logged in', () => {
			let response;
			before(() => {
				return serverHelper.getAuthCookie().then((cookie) => {
					return new Promise((resolve) => {
						server.inject({
							method: 'GET',
							url: `/session/create`,
							headers: {
								cookie: cookie
							}
						}, (res) => {
							resolve(res);
						});
					});
				}).then((res) => {
					response = res;
				});
			});
			it('redirects to dashboard', () => {
				return expect(response.headers.location).to.eql('/');
			});

		});
	});
});
