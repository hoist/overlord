'use strict';
import React from 'react';

class ProjectRow extends React.Component {
  constructor(props) {
    super(props);
    this.activateProject = () => {
      global.location = `/project/${this.props.project.name}/activate`;
    };
  }

  render () {
    return (
      <div className="row">
        <div className="col-sm-4">
          {this.props.project.name}
        </div>
        <div className="col-sm-8 pull-right">
          <a className="btn btn-success" onClick={this.activateProject}>Activate</a>
        </div>
      </div>
    );
  }
}
ProjectRow.displayName = 'Project Table Row';
ProjectRow.propTypes = {
  project: React.PropTypes.object.isRequired
};

export
default ProjectRow;
