'use strict';
import Project from '../../../models/project';
import ProjectBuild from '../../../models/project_build';
import ProjectDeployConfiguration from '../../../models/project_deploy_configuration';
import ProjectDeployment from '../../../models/project_deployment';
import {
  omit
}
from 'lodash';
class CircleCIWebhook {
  registerBuild(project, payload, user) {
    return new ProjectBuild({
      project: project,
      branch: payload.branch,
      build: payload.build_num,
      sha1: payload.vcs_revision,
      compareUrl: payload.compare,
      log: omit(payload, 'steps'),
      publisher: user
    }).saveAsync().spread((build) => {
      return build;
    });
  }
  triggerDeployment(project, build, payload) {
    //don't deploy unsuccessful builds
    if (payload.status.toLowerCase() !== 'success') {
      return null;
    }
    return ProjectDeployConfiguration.findOneAsync({
      project: project._id,
      vcs: {
        branch: payload.branch
      }
    }).then((deployConfig) => {
      if (!deployConfig) {
        return null;
      } else {
        return new ProjectDeployment({
          projectBuild: build,
          deployConfiguration: deployConfig,
          releaseNumber: deployConfig.nextReleaseNumber
        }).saveAsync().then(() => {
          return deployConfig.incrementVersion();
        });
      }
    });
  }
  process(request, reply) {
    //circleci stores payload in the payload varable
    let payload = request.payload.payload;
    let created = false;
    //only process successful builds, ignore the rest

    return Project.findOneAsync({
      vcs: {
        username: payload.username,
        repository: payload.reponame
      }
    }).then((project) => {
      if (!project) {
        //we should create a project for this repository
        created = true;
        project = new Project({
          status: 'PENDING',
          name: payload.reponame,
          vcs: {
            username: payload.username,
            repository: payload.reponame
          }
        });
        return project.saveAsync().then(function (results) {
          return results[0];
        });
      } else {
        return project;
      }
    }).then((project) => {
      return this.registerBuild(project, payload, request.auth.credentials)
        .then((build) => {
          return this.triggerDeployment(project, build, payload);
        }).then(() => {
          return project;
        });
    }).then((project) => {
      var status = 200;
      if (created) {
        status = 201;
      }
      let response = reply(project.toObject());
      response.statusCode = status;
    });
  }
}


export default new CircleCIWebhook();
