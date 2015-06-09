'use strict';
import configureServer from '../../../../lib/web_app/server';
import mongoose from 'mongoose';
import Bluebird from 'bluebird';
import config from 'config';
import Project from '../../../../lib/models/project';
import {
	ServerHelper
}
from '../../../fixtures/helpers';
import cheerio from 'cheerio';
import {
	expect
}
from 'chai';

Bluebird.promisifyAll(mongoose);

describe('project view routes', () => {
	let server;
	let serverHelper;
	let existingActiveProject;
	let existingPendingProject;
	before(() => {
		return Promise.all([
			mongoose.connectAsync(config.get('Hoist.mongo.overlord')),
			new Project({
				name: 'pending project',
				status: 'PENDING',
				vcs: {
					repository: 'repo',
					username: 'username'
				}
			}).saveAsync().spread((project) => {
				existingPendingProject = project;
			}),
			new Project({
				name: 'pending project',
				status: 'ACTIVE',
				vcs: {
					repository: 'repo',
					username: 'username'
				}
			}).saveAsync().spread((project) => {
				existingActiveProject = project;
			}),
			configureServer().then((s) => {
				server = Bluebird.promisifyAll(s);
				serverHelper = new ServerHelper(server);
			}).then(() => {
				return serverHelper.setupTestUser();
			})
		]);
	});
	after(() => {
		return Bluebird.promisify(mongoose.connection.db.dropDatabase, mongoose.connection.db)()
			.then(() => {
				return mongoose.disconnectAsync();
			});
	});


	describe('GET /projects', () => {
		describe('if not logged in', () => {
			before(function () {
				serverHelper.testSecuredRoute('/projects').then((res) => {
					this.response = res;
				});
			});
			ServerHelper.isSecuredRoute();
		});
		describe('if logged in', () => {
			let response;
			let $;
			before(() => {
				return serverHelper.getAuthCookie().then((cookie) => {
					return new Promise((resolve) => {
						server.inject({
							method: 'GET',
							url: `/projects`,
							headers: {
								cookie: cookie
							}
						}, (res) => {
							resolve(res);
						});
					});
				}).then((res) => {
					response = res;
					$ = cheerio.load(response.payload);
				});
			});
			it('returns project list view', () => {
				return expect($('title').text()).to.eql('Projects');
			});
			it('displays activate button for pending projects', () => {
				return expect($('#project-row-' + existingPendingProject._id + ' button').first().text()).to.eql('Activate');
			});
			it('displays edit button for active projects', () => {
				return expect($('#project-row-' + existingActiveProject._id + ' button').first().text()).to.eql('Edit');
			});
		});
	});
	describe('GET /project/{id}', () => {
		describe('if not logged in', () => {
			before(function () {
				serverHelper.testSecuredRoute(`/project/{existingActiveProject._id}`).then((res) => {
					this.response = res;
				});
			});
			ServerHelper.isSecuredRoute();
		});
		describe('with pending project', () => {
			let response;
			before(() => {
				return serverHelper.getAuthCookie().then((cookie) => {
					return new Promise((resolve) => {
						server.inject({
							method: 'GET',
							url: `/project/${existingPendingProject._id}`,
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
			it('redirects', () => {
				return expect(response.statusCode).to.eql(302);
			});
			it('redirects to activate page', () => {
				return expect(response.headers.location).to.eql(`/project/${existingPendingProject._id}/activate`);
			});
		});
	});
	describe('GET /project/{id}/activate', () => {
		describe('if not logged in', () => {
			before(function () {
				serverHelper.testSecuredRoute(`/project/{existingActiveProject._id}/activate`).then((res) => {
					this.response = res;
				});
			});
			ServerHelper.isSecuredRoute();
		});
		describe('with active project', () => {
			let response;
			before(() => {
				return serverHelper.getAuthCookie().then((cookie) => {
					return new Promise((resolve) => {
						server.inject({
							method: 'GET',
							url: `/project/${existingActiveProject._id}/activate`,
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
			it('redirects', () => {
				return expect(response.statusCode).to.eql(302);
			});
			it('redirects to details page', () => {
				return expect(response.headers.location).to.eql(`/project/${existingActiveProject._id}`);
			});
		});
	});
});
