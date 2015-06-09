'use strict';
import React from "react";

class ProjectForm extends React.Component {
  render() {
    return (
      <form action="" className="form-horizontal" method="POST">
        <div className="row">
          <h1>Activate: {this.props.project.name}</h1>
        </div>
        <div className="form-group">
          <label className="control-label col-sm-2" htmlFor="name">Name</label>
          <div className="col-sm-10">
            <input className="form-control" defaultValue={this.props.project.name} id="name" placeholder="name" required="true"/>
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-sm-2" htmlFor="unitText">Unit File:</label>
          <div className="col-sm-10">
            <textarea className="form-control" defaultValue={this.props.project.unitText} id="unitText" placeholder="Unit File" required="true" rows="17"></textarea>
          </div>
        </div>
        <div className="form-group">
          <div className="col-sm-offset-2 col-sm-10 btn-group">
            <button className="btn btn-default">Cancel</button>
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
  project: React.PropTypes.object.isRequired
};

export default ProjectForm;
