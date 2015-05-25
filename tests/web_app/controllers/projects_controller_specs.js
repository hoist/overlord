'use strict';
import ProjectsController from '../../../lib/web_app/controllers/projects_controller';
import configureServer from '../../../lib/web_app/server';
import {
	expect
}
from 'chai';
import Sinon from 'sinon';
import Project from '../../../lib/models/project';
import ProjectBuild from '../../../lib/models/project_build';
import APIToken from '../../../lib/models/api_token';
import mongoose from 'mongoose';

describe('project controller', () => {
	describe('routes', () => {
		before(() => {
			return configureServer();
		});
		describe('GET /project', () => {
			let route;
			before(() => {
				return configureServer().then((server) => {
					return server.match('get', '/projects');
				}).then((r) => {
					route = r;
				});
			});
			it('maps to #index', () => {
				return expect(route.settings.bind).to.be.instanceOf(ProjectsController) &&
					expect(route.settings.handler).to.eql(route.settings.bind.index);
			});
			it('uses session auth', () => {
				return expect(route.settings.auth.strategies[0]).to.eql('session');
			});
		});
		describe('POST /api/build/#{project}', () => {
			let route;
			before(() => {
				return configureServer().then((server) => {
					return server.match('post', '/api/build/myproject');
				}).then((r) => {
					route = r;
				});
			});
			it('maps to #registerBuild', () => {
				return expect(route.settings.bind).to.be.instanceOf(ProjectsController) &&
					expect(route.settings.handler).to.eql(route.settings.bind.registerBuild);
			});
			it('uses token auth', () => {
				return expect(route.settings.auth.strategies[0]).to.eql('token');
			});
		});
	});
	describe('#index', () => {
		let mockRequest = {};
		let mockReply = {
			view: Sinon.stub()
		};
		before(() => {
			var controller = new ProjectsController();
			return controller.index(mockRequest, mockReply);
		});
		it('returns view', () => {
			expect(mockReply.view)
				.to.have.been.calledWith('projects/index', {
					title: 'Projects'
				});
		});
	});
	describe('#registerBuild', () => {
		let request;
		let reply = Sinon.stub();
		let savedProject;
		let savedProjectBuild;
		let apiToken = new APIToken({
			_id: new mongoose.Types.ObjectId()
		});
		before(() => {
			Sinon.stub(Project, 'findOneAsync');
			Sinon.stub(Project.prototype, 'saveAsync', function () {
				savedProject = this;
				return Promise.resolve(null);
			});
			Sinon.stub(ProjectBuild.prototype, 'saveAsync', function () {
				savedProjectBuild = this;
				return Promise.resolve(null);
			});
		});
		after(() => {
			Project.findOneAsync.restore();
			Project.prototype.saveAsync.restore();
			ProjectBuild.prototype.saveAsync.restore();
		});

		describe('when project doesn\'t exist', () => {
			before(() => {
				request = {
					params: {
						project: 'new project'
					},
					payload: {
						build: 24,
						branch: 'branch',
						sha1: 'sha1',
						compareUrl: 'http://compare'
					},
					auth: {
						isAuthenticated: true,
						credentials: apiToken.toObject()
					}
				};
				Project.findOneAsync.withArgs({
					name: 'new project'
				}).returns(Promise.resolve(null));
				var controller = new ProjectsController();
				return controller.registerBuild(request, reply);
			});
			after(() => {
				savedProject = undefined;
				savedProjectBuild = undefined;

			});
			it('returns 200', () => {
				return expect(reply)
					.to.have.been.calledWith(200);
			});
			it('creates project', () => {
				return expect(savedProject.name)
					.to.eql('new project');
			});
			it('marks project as pending', () => {
				return expect(savedProject.status)
					.to.eql('PENDING');
			});
			it('creates build', () => {
				return expect(savedProjectBuild.project)
					.to.eql(savedProject);
			});
			it('sets API Token', () => {
				return expect(savedProjectBuild.author)
					.to.eql(apiToken._id);
			});
			it('sets build number', () => {
				return expect(savedProjectBuild.build)
					.to.eql(24);
			});
			it('sets sha1', () => {
				return expect(savedProjectBuild.sha1)
					.to.eql('sha1');
			});
			it('sets comparison url', () => {
				return expect(savedProjectBuild.compareUrl)
					.to.eql('http://compare');
			});
		});
		describe('when project exists', () => {
			let project = new Project();
			before(() => {
				request = {
					params: {
						project: 'new project'
					},
					payload: {
						build: 24,
						branch: 'branch',
						sha1: 'sha1',
						compareUrl: 'http://compare'
					},
					auth: {
						isAuthenticated: true,
						credentials: apiToken.toObject()
					}
				};

				Project.findOneAsync.withArgs({
					name: 'new project'
				}).returns(Promise.resolve(project));
				var controller = new ProjectsController();
				return controller.registerBuild(request, reply);
			});
			after(() => {
				savedProject = undefined;
				savedProjectBuild = undefined;
			});
			it('creates build', () => {
				return expect(savedProjectBuild.project)
					.to.eql(project);
			});
			it('sets API Token', () => {
				return expect(savedProjectBuild.author)
					.to.eql(apiToken._id);
			});
			it('sets build number', () => {
				return expect(savedProjectBuild.build)
					.to.eql(24);
			});
			it('sets sha1', () => {
				return expect(savedProjectBuild.sha1)
					.to.eql('sha1');
			});
			it('sets comparison url', () => {
				return expect(savedProjectBuild.compareUrl)
					.to.eql('http://compare');
			});
			it('doesn\'t create project', () => {
				return expect(savedProject).to.eql(project);
			});
		});
	});
});
