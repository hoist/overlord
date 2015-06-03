'use strict';
import configureServer from '../../../lib/web_app/server';
import User from '../../../lib/models/user';
import Environment from '../../../lib/models/environment';
import mongoose from 'mongoose';
import Bluebird from 'bluebird';
import config from 'config';
import cheerio from 'cheerio';
import {
	expect
}
from 'chai';
Bluebird.promisifyAll(mongoose);
describe('environment api', () => {
	let server;
	let getAuthCookie = () => {
		return new Promise((resolve) => {
			server.inject({
				method: 'GET',
				url: '/TEST/login'
			}, (loginResponse) => {
				var header = loginResponse.headers['set-cookie'];
				var cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\"\,\;\\\x7F]*))/);
				resolve(cookie[0]);
			});
		});
	};
	before(() => {
		return Promise.all([
			mongoose.connectAsync(config.get('Hoist.mongo.overlord')),
			configureServer().then((s) => {
				server = Bluebird.promisifyAll(s);
			}).then(() => {
				return new User({
					name: 'unit test user',
					username: 'tests@hoist.io'
				}).saveAsync().spread((user) => {
					return user;
				});
			}).then((testUser) => {
				server.route({
					method: 'GET',
					path: '/TEST/login',
					config: {
						auth: {
							mode: 'try',
							strategy: 'session'
						},
						plugins: {
							'hapi-auth-cookie': {
								redirectTo: false
							}
						},
						handler: function (request, reply) {
							request.auth.session.set({
								user: testUser
							});
							return reply(testUser);
						}
					}
				});
			})
		]);
	});
	after(() => {
		return Bluebird.promisify(mongoose.connection.db.dropDatabase, mongoose.connection.db)()
			.then(() => {
				return mongoose.disconnectAsync();
			});
	});
	describe('GET /environments', () => {
		describe('if logged in', () => {
			let response;
			before(() => {
				return getAuthCookie().then((cookie) => {
					return new Promise((resolve) => {
						server.inject({
							method: 'GET',
							url: `/environments`,
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
			it('returns view', () => {
				let $ = cheerio.load(response.payload);
				return expect($('title').text()).to.eql('Environments');
			});
			it('returns [ok|200] response', () => {
				return expect(response.statusCode).to.eql(200);
			});
		});
		describe('if not logged in', () => {
			let response;
			before(() => {
				return new Promise((resolve) => {
					server.inject({
						method: 'GET',
						url: `/environments`
					}, (res) => {
						resolve(res);
					});
				}).then((res) => {
					response = res;
				});
			});
			it('returns [redirect|302] response', () => {
				return expect(response.statusCode).to.eql(302);
			});
			it('redirects to login page', () => {
				return expect(response.headers.location).to.eql('/session/create');
			});
		});
	});
	describe('POST /api/environment', () => {
		let testPayload = {
			name: 'test environment',
			fleetUrl: 'http://testfleeturl'
		};
		describe('if not logged in', () => {
			let response;
			before(() => {
				return new Promise((resolve) => {
					server.inject({
						method: 'POST',
						url: `/api/environment`,
						payload: testPayload
					}, (res) => {
						resolve(res);
					});
				}).then((res) => {
					response = res;
				});
			});
			it('returns an [unauthorised|401] response', () => {
				return expect(response.statusCode).to.eql(401);
			});
		});
		describe('with valid payload', () => {
			let response;
			before(() => {
				return getAuthCookie().then((cookie) => {
					return new Promise((resolve) => {
						server.inject({
							method: 'POST',
							url: `/api/environment`,
							payload: testPayload,
							headers: {
								cookie: cookie
							}
						}, (res) => {
							resolve(res);
						});
					}).then((res) => {
						response = res;
					});
				});
			});
			after(() => {
				return Environment.removeAsync({});
			});
			it('returns a [created|201] response', () => {
				return expect(response.statusCode).to.eql(201);
			});
			it('creates the environment', () => {
				return Environment.countAsync()
					.then((count) => {
						return expect(count).to.eql(1);
					});
			});
		});
		describe('with an existing name', () => {
			let response;
			before(() => {
				return new Environment({
					name: 'test environment',
					fleetUrl: 'someurl'
				}).saveAsync().then(() => {
					return getAuthCookie().then((cookie) => {
						return new Promise((resolve) => {
							server.inject({
								method: 'POST',
								url: `/api/environment`,
								payload: testPayload,
								headers: {
									cookie: cookie
								}
							}, (res) => {
								resolve(res);
							});
						}).then((res) => {
							response = res;
						});
					});
				});
			});
			after(() => {
				return Environment.removeAsync({});
			});
			it('returns a [conflict|409] response', () => {
				return expect(response.statusCode).to.eql(409);
			});
			it('does not create a new enivrionment', () => {
				return Environment.countAsync()
					.then((count) => {
						return expect(count).to.eql(1);
					});
			});
			it('returns an error body', () => {
				return expect(response.result).to.exist;
			});
			it('returns an error message saying name must be unique', () => {
				return expect(response.result.message).to.eql('an environment with that name already exists');
			});
		});
		describe('with no name', () => {
			let response;
			let originalName;
			before(() => {
				originalName = testPayload.name;
				delete testPayload.name;
				return getAuthCookie().then((cookie) => {
					return new Promise((resolve) => {
						server.inject({
							method: 'POST',
							url: `/api/environment`,
							payload: testPayload,
							headers: {
								cookie: cookie
							}
						}, (res) => {
							resolve(res);
						});
					}).then((res) => {
						response = res;
					});
				});
			});
			after(() => {
				testPayload.name = originalName;
				return Environment.removeAsync({});
			});
			it('returns a [bad request|400] response', () => {
				return expect(response.statusCode).to.eql(400);
			});
			it('does not create a new enivrionment', () => {
				return Environment.countAsync()
					.then((count) => {
						return expect(count).to.eql(0);
					});
			});
			it('returns an error body', () => {
				return expect(response.result).to.exist;
			});
			it('returns an error message saying name is required', () => {
				return expect(response.result.errors.name.message).to.eql('name is required');
			});
		});
		describe('with no fleet url', () => {
			let response;
			let originalUrl;
			before(() => {
				originalUrl = testPayload.fleetUrl;
				delete testPayload.fleetUrl;
				return getAuthCookie().then((cookie) => {
					return new Promise((resolve) => {
						server.inject({
							method: 'POST',
							url: `/api/environment`,
							payload: testPayload,
							headers: {
								cookie: cookie
							}
						}, (res) => {
							resolve(res);
						});
					}).then((res) => {
						response = res;
					});
				});
			});
			after(() => {
				testPayload.fleetUrl = originalUrl;
				return Environment.removeAsync({});
			});
			it('returns a [bad request|400] response', () => {
				return expect(response.statusCode).to.eql(400);
			});
			it('does not create a new enivrionment', () => {
				return Environment.countAsync()
					.then((count) => {
						return expect(count).to.eql(0);
					});
			});
			it('returns an error body', () => {
				return expect(response.result).to.exist;
			});
			it('returns an error message saying fleet url is required', () => {
				return expect(response.result.errors.fleetUrl.message).to.eql('fleet url is required');
			});
		});
	});
});
