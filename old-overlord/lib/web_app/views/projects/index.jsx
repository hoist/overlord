'use strict';
import React from "react";
import Transmit from "react-transmit";
import Page from '../_components/page.jsx';
import ProjectTable from './components/project_table.jsx';
import {}
from 'isomorphic-fetch';

class ProjectIndex extends React.Component {
  render () {

    return (
      <Page {...this.props}>
        <div className="container">
          <div className="panel">
            <h3 className="panel-heading">Projects</h3>
            <div className="panel-body">
              <ProjectTable projects={this.props.projects} />
            </div>
          </div>
        </div>
      </Page>
    );
  }
}

ProjectIndex.displayName = 'Project Index Page';
ProjectIndex.propTypes = {
  projects: React.PropTypes.arrayOf(React.PropTypes.object),
  setQueryParams: React.PropTypes.func.isRequired
};
export default Transmit.createContainer(ProjectIndex, {
  queryParams: {},
  queries: {
    projects() {
      if (process && process.browser) {
        return global.fetch(`/api/projects`, {
          credentials: 'include'
        }).then((response) => response.json());
      } else {
        return Promise.resolve([]);
      }
    }
  }
});


