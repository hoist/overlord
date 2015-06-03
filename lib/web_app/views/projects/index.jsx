'use strict';
import React from "react";
import Transmit from "react-transmit";
import Page from '../_components/page.jsx';
import ProjectTable from './components/project_table.jsx';
import {} from 'isomorphic-fetch';

class ProjectIndex extends React.Component{
  render () {

    return (
       <Page {...this.props}>
          <div className="container">
            <ProjectTable status="pending" />
            <ProjectTable status="active" />
          </div>
       </Page>
      );
  }
}

ProjectIndex.displayName = 'Project Index Page';
ProjectIndex.propTypes = {
  setQueryParams: React.PropTypes.func.isRequired
};
export default Transmit.createContainer(ProjectIndex, {
  queryParams: {},
  queries: {
  }
});

