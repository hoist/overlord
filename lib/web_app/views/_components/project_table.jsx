'use strict';
import React from 'react';
import ProjectRow from './project_row.jsx';


class ProjectTable extends React.Component{

  render (){
    if (!this.props.projects || this.props.projects.length === 0) {
      return null;
    }
    return (
        <table className={this.props.status + ' panel col col3'}>
          <thead>
            <tr className="head">
              <td className="name head">
                Project Name
              </td>
              <td>
              </td>
            </tr>
          </thead>
          <tbody>
            {this.props.projects.map((project, i)=>{
              return <ProjectRow key={i} project={project} />;
            })}
          </tbody>
        </table>

      );
  }
}
ProjectTable.displayName = 'Project Table';
ProjectTable.propTypes = {
    projects: React.PropTypes.arrayOf(React.PropTypes.object),
    status: React.PropTypes.string.isRequired
};

export default ProjectTable;
