'use strict';
import React from "react";

class ProjectForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      project: this.props.initialProject,
      errors: {}
    };
    this.handleSubmit = (e) => {
      e.preventDefault();
      var name = React.findDOMNode(this.refs.name).value.trim();
      var vcsRepository = React.findDOMNode(this.refs['vcs.repository']).value.trim();
      var vcsUsername = React.findDOMNode(this.refs['vcs.username']).value.trim();
      var project = {
        name: name,
        vcs: {
          username: vcsUsername,
          repository: vcsRepository
        }
      };
      this.saveProject(project);
    };
    this.handleCancel = (e) => {
      e.preventDefault();
      global.location = '/projects';
    };
  }
  saveProject(project) {
    return global.fetch(`/api/project/${this.props.initialProject._id}`, {
      credentials: 'include',
      method: 'put',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(project)
    }).then((response) => {
      return response.json();
    }).then((response) => {
      //presence of response.statuscode indicates a non 200 response
      if (response.statusCode) {
        this.setState({
          project: project,
          errors: response.errors || {}
        });
      } else {
        global.location = `/project/${this.props.initialProject._id}`;
      }
    }).catch((err) => {
      console.log('error', err);
    });
  }
  render() {
    return (
      <form className="form-horizontal" onSubmit={this.handleSubmit}>
        <div className="row">
          <h1>Activate: {this.state.project.name}</h1>
        </div>
        <div className="form-group">
          <label className="control-label col-sm-2" htmlFor="name">Name</label>
          <div className="col-sm-10">
            <input className="form-control" defaultValue={this.state.project.name} id="name" placeholder="name" ref="name" required="true"/>
          </div>
        </div>
        <h4>Source Control Settings</h4>
        <div className="form-group">
          <label className="control-label col-sm-2" htmlFor="unitText">Username:</label>
          <div className="col-sm-10">
            <input className="form-control" defaultValue={this.state.project.vcs.username} id="vcs.username" placeholder="Username" ref="vcs.username" required="true"/>
          </div>
        </div>
        <div className="form-group">
           <label className="control-label col-sm-2" htmlFor="unitText">Repository:</label>
          <div className="col-sm-10">
            <input className="form-control" defaultValue={this.state.project.vcs.repository} id="vcs.repository" placeholder="Repository" ref="vcs.repository" required="true"/>
          </div>
        </div>
        <div className="form-group">
          <div className="col-sm-offset-2 col-sm-10 btn-group">
            <button className="btn btn-default" onClick={this.handleCancel}>Cancel</button>
            <button className="btn btn-success" type="submit">{this.props.action}</button>
          </div>
        </div>
      </form>
    );
  }
}
ProjectForm.displayName = 'Project Form';
ProjectForm.propTypes = {
  action: React.PropTypes.string.isRequired,
  initialProject: React.PropTypes.object.isRequired
};

export default ProjectForm;
