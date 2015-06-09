'use strict';
import React from 'react';

class ProjectRow extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = () => {
      var location = `/project/${this.props.project._id}`;
      if (this.props.project.status.toLowerCase() === 'pending') {
        location = location + '/activate';
      }
      global.location = location;
    };
  }

  render() {
    var action = 'Activate';
    if (this.props.project.status.toLowerCase() === 'pending') {
      action = 'Activate';
    } else {
      action = 'Edit';
    }
    return (
      <tr id={'project-row-' + this.props.project._id}>
        <td className="">
          {this.props.project.name}
        </td>
        <td className="">
          <button className="btn btn-success" onClick={this.handleClick}>{action}</button>
        </td>
      </tr>
    );
  }
}
ProjectRow.displayName = 'Project Table Row';
ProjectRow.propTypes = {
  project: React.PropTypes.object.isRequired
};

export default ProjectRow;
