'use strict';
import configureServer from '../../../lib/web_app/server';
import APIToken from '../../../lib/models/api_token';
import Project from '../../../lib/models/project';
import config from 'config';
import mongoose from 'mongoose';
import Bluebird from 'bluebird';
import {
	expect
}
from 'chai';

Bluebird.promisifyAll(mongoose);

describe('create project API', function () {
	let server;
	let apiToken;
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
			})
		]);
	});
	after(() => {
		return Promise.all([
			APIToken.removeAsync({}),
			Project.removeAsync({})
		]).then(() => {
			return mongoose.disconnectAsync();
		});
	});
	describe('POST to /API/build/new project', () => {
		let response;
		before(function () {
			return new Promise((resolve) => {
				server.inject({
					method: 'POST',
					url: `/api/build/new project?api_token=${apiToken.token}`,
					payload: {
						build: 22,
						branch: 'feature/somebranch',
						sha1: 'sha1',
						compareUrl: 'http://compare'
					}
				}, (res) => {
					resolve(res);
				});
			}).then((res) => {
				response = res;
			});
		});
		after(() => {
			return Project.removeAsync({});
		});
		it('returns [OK]', () => {
			expect(response.statusCode).to.eql(200);
		});
		it('creates the project', () => {
			return Project.findOneAsync({
				name: 'new project'
			}).then((project) => expect(project).to.exist);
		});
	});
	describe('unathenticated POST to /API/build/new project', () => {
		let response;
		before(function () {
			return new Promise((resolve) => {
				server.inject({
					method: 'POST',
					url: `/api/build/new project?api_token=bad_token`,
					payload: {
						build: 22,
						branch: 'feature/somebranch',
						sha1: 'sha1',
						compareUrl: 'http://compare'
					}
				}, (res) => {
					resolve(res);
				});
			}).then((res) => {
				response = res;
			});
		});
		after(() => {
			return Project.removeAsync({});
		});
		it('returns [Unauthorized]', () => {
			expect(response.statusCode).to.eql(401);
		});
		it('doesn\'t create the project', () => {
			return Project.findOneAsync({
				name: 'new project'
			}).then((project) => expect(project).to.not.exist);
		});
	});
});
