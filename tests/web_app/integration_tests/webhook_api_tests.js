'use strict';
import configureServer from '../../../lib/web_app/server';
import APIToken from '../../../lib/models/api_token';
import config from 'config';
import mongoose from 'mongoose';
import Bluebird from 'bluebird';
import Project from '../../../lib/models/project';
import ProjectDeployConfiguration from '../../../lib/models/project_deploy_configuration';
import ProjectDeployment from '../../../lib/models/project_deployment';
import ProjectBuild from '../../../lib/models/project_build';
import Environment from '../../../lib/models/environment';

import {
	expect
}
from 'chai';

Bluebird.promisifyAll(mongoose);

describe('Webhook API', () => {
	let server;
	let apiToken;
	let environment;
	before(() => {
		return Promise.all([
			mongoose.connectAsync(config.get('Hoist.mongo.overlord')),
			configureServer().then((s) => {
				server = Bluebird.promisifyAll(s);
			}),
			new APIToken({
				name: 'unit test token'
			}).saveAsync().spread((token) => {
				apiToken = token;
			}),
			new Environment({
				name: 'live'
			}).saveAsync().spread((env) => {
				environment = env;
			})

		]);
	});
	after(() => {
		Bluebird.promisify(mongoose.connection.db.dropDatabase, mongoose.connection.db)()
			.then(() => {
				return mongoose.disconnectAsync();
			});
	});
	describe('POST => /api/webhook/circle', () => {
		let examplePayload;
		before(() => {
			examplePayload = require('../../fixtures/example_webhook_payloads/circleci.json');
		});
		describe('if api token doesn\'t exist', () => {
			let response;
			before(() => {
				return new Promise((resolve) => {
					server.inject({
						method: 'POST',
						url: `/api/webhook/circleci?api_token=some_token`,
						payload: examplePayload
					}, (res) => {
						resolve(res);
					});
				}).then((res) => {
					response = res;
				});
			});
			it('responds with a [unauthorised|401] status', () => {
				return expect(response.statusCode).to.eql(401);
			});
		});
		describe('if there are no matching projects', () => {
			let response;
			before(() => {
				return new Promise((resolve) => {
					server.inject({
						method: 'POST',
						url: `/api/webhook/circleci?api_token=${apiToken.token}`,
						payload: examplePayload
					}, (res) => {
						resolve(res);
					});
				}).then((res) => {
					response = res;
				});
			});
			after(() => {
				return Promise.all([
					Project.removeAsync({}),
					ProjectDeployConfiguration.removeAsync({}),
					ProjectBuild.removeAsync({}),
					ProjectDeployment.removeAsync({})
				]);
			});
			it('registers a pending project based on the repo name', () => {
				return Project.findOneAsync({
					name: 'overlord'
				}).then((project) => {
					expect(project.status).to.eql('PENDING');
				});
			});
			it('sets the correct vcs parameters', () => {
				return Project.findOneAsync({})
					.then((project) => {
						expect(project.vcs.username).to.eql('hoist');
						expect(project.vcs.repository).to.eql('overlord');
					});

			});
			it('responds with a [created|201] status', () => {
				return expect(response.statusCode).to.eql(201);
			});
		});
		describe('if there are no matching deploy configurations', () => {
			let response;
			before(() => {
				return new Project({
					name: 'overlord',
					status: 'ACTIVE',
					vcs: {
						username: 'hoist',
						repository: 'overlord'
					}
				}).saveAsync().then(function () {
					return new Promise((resolve) => {
						server.inject({
							method: 'POST',
							url: `/api/webhook/circleci?api_token=${apiToken.token}`,
							payload: examplePayload
						}, (res) => {
							resolve(res);
						});
					}).then((res) => {
						response = res;
					});
				});
			});
			after(() => {
				return Promise.all([
					Project.removeAsync({}),
					ProjectDeployConfiguration.removeAsync({}),
					ProjectBuild.removeAsync({}),
					ProjectDeployment.removeAsync({})
				]);
			});
			it('responses with an [ok|200] status', () => {
				return expect(response.statusCode).to.eql(200);
			});
		});
		describe('if there is a matching deploy configuration', () => {
			let response;
			let project;
			before(() => {
				return new Project({
						name: 'overlord',
						status: 'ACTIVE',
						vcs: {
							username: 'hoist',
							repository: 'overlord'
						}
					}).saveAsync()
					.then((result) => {
						project = result[0];
						return new ProjectDeployConfiguration({
							project: project,
							vcs: {
								branch: 'master'
							},
							environment: environment,
							serviceConfig: 'some release unit file',
							scale: 3,
							name: 'live/web',
							nextReleaseNumber: '1.0.0'
						}).saveAsync();
					}).then(function () {
						return new Promise((resolve) => {
							server.inject({
								method: 'POST',
								url: `/api/webhook/circleci?api_token=${apiToken.token}`,
								payload: examplePayload
							}, (res) => {
								resolve(res);
							});
						}).then((res) => {
							response = res;
						});
					});
			});
			after(() => {
				return Promise.all([
					Project.removeAsync({}),
					ProjectDeployConfiguration.removeAsync({}),
					ProjectBuild.removeAsync({}),
					ProjectDeployment.removeAsync({})
				]);
			});
			it('creates a project deployment', () => {
				return ProjectDeployment.countAsync()
					.then((count) => {
						return expect(count).to.eql(1);
					});
			});
			it('registers a build', () => {
				return ProjectBuild.countAsync()
					.then((count) => {
						return expect(count).to.eql(1);
					});
			});
			it('links build to deploy', () => {

				return ProjectBuild.findOneAsync({
					project: project._id
				}).then((build) => {
					return ProjectDeployment.findOneAsync({
						projectBuild: build._id
					}).then((deployment) => {
						return expect(deployment).to.exist;
					});
				});
			});
			it('increments next release number', () => {
				return ProjectDeployConfiguration.findOneAsync({
						project: project
					})
					.then((deployConfiguration) => {
						return expect(deployConfiguration.nextReleaseNumber).to.eql('1.0.1');
					});
			});
			it('responds with an [ok|200] status', () => {
				return expect(response.statusCode).to.eql(200);
			});
		});
		describe('if the build is a failure', () => {
			let response;
			let project;
			before(() => {
				examplePayload.status = 'failed';
				return new Project({
						name: 'overlord',
						status: 'ACTIVE',
						vcs: {
							username: 'hoist',
							repository: 'overlord'
						}
					}).saveAsync()
					.then((result) => {
						project = result[0];
						return new ProjectDeployConfiguration({
							project: project,
							vcs: {
								branch: 'master'
							},
							environment: environment,
							serviceConfig: 'some release unit file',
							scale: 3,
							name: 'live/web',
							nextReleaseNumber: '1.0.0'
						}).saveAsync();
					}).then(function () {
						return new Promise((resolve) => {
							server.inject({
								method: 'POST',
								url: `/api/webhook/circleci?api_token=${apiToken.token}`,
								payload: examplePayload
							}, (res) => {
								resolve(res);
							});
						}).then((res) => {
							response = res;
						});
					});
			});
			after(() => {
				examplePayload.status = 'success';
				return Promise.all([
					Project.removeAsync({}),
					ProjectDeployConfiguration.removeAsync({}),
					ProjectBuild.removeAsync({}),
					ProjectDeployment.removeAsync({})
				]);
			});
			it('does not create a deploy', () => {
				it('creates a project deployment', () => {
					return ProjectDeployment.countAsync()
						.then((count) => {
							return expect(count).to.eql(0);
						});
				});
			});
			it('responds with an [ok|200] status', () => {
				return expect(response.statusCode).to.eql(200);
			});
		});
	});
});
