'use strict';
import React from 'react';
import ProjectRow from './project_row.jsx';
import {
  sortByAll
}
from 'lodash';
class ProjectTable extends React.Component {
  render() {
    var sortedProjects = sortByAll(this.props.projects, (project) => {
      if (project.status.toLowerCase() === 'pending') {
        return 0;
      } else {
        return 1;
      }
    }, 'name');
    return (
      <table className="table table-hover table-striped">
        <thead>
          <tr>
            <th className="col-xs-10">
              Project Name
            </th>
            <th className="col-xs-2">
            </th>
          </tr>
        </thead>
        <tbody>
          {
            sortedProjects.map((project, i) => {
              return <ProjectRow key={i} project={project} />;
            })
          }
        </tbody>
      </table>
    );
  }
}
ProjectTable.displayName = 'Project Table';
ProjectTable.propTypes = {
  projects: React.PropTypes.arrayOf(React.PropTypes.object)
};

export default ProjectTable;
