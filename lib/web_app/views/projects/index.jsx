'use strict';
import React from "react";
import Transmit from "react-transmit";
import Page from '../_components/page.jsx';
import ProjectTable from '../_components/project_table.jsx';
import { groupBy } from 'lodash';
import {} from 'isomorphic-fetch';

class ProjectIndex extends React.Component{
  componentWillMount() {
    if (process && process.browser) {
      //this forces a reload of components on the client
      this.props.setQueryParams({
        run: true
      });
    }
  }
  render () {
    var groupedProjects = groupBy(this.props.projects, (project) => {
      return project.status;
    });

    return (
       <Page {...this.props}>
          <div className="col col3">
            <ProjectTable projects={groupedProjects.PENDING} status="pending" />
            <ProjectTable projects={groupedProjects.ACTIVE} status="active" />
          </div>
       </Page>
      );
  }
}

ProjectIndex.displayName = 'Project Index Page';
ProjectIndex.propTypes = {
  projects: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  setQueryParams: React.PropTypes.func.isRequired
};
export default Transmit.createContainer(ProjectIndex, {
  queryParams: {},
  queries: {
    projects() {
      if (process && process.browser) {
        return global.fetch('/api/projects', {
          credentials: 'include'
        }).then((response) => response.json());
      } else {
        return new Promise((resolve) => {
          resolve([]);
        });
      }
    }
  }
});

