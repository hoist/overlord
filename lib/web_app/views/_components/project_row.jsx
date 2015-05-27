'use strict';
import React from 'react';


class ProjectRow extends React.Component{
  constructor(props) {
    super(props);
    this.activateProject = () => {
      global.location = `/project/${this.props.project.name}/activate`;
    };
  }

  render (){
    var markup;
    if (this.props.project.status === "PENDING") {
      markup = (
        <tr>
          <td>{this.props.project.name}</td>
          <td className="col col1"><div className="button button-success" onClick={this.activateProject}>Activate</div></td>
        </tr>
        );
    } else {
      markup = (
        <tr>
          <td>{this.props.project.name}</td>
          <td className="col col1">View Builds</td>
        </tr>
        );
    }

    return markup;
  }
}
ProjectRow.displayName = 'Project Table Row';
ProjectRow.propTypes = {
  project: React.PropTypes.object.isRequired
};

export default ProjectRow;

