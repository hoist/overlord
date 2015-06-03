'use strict';
import React from "react";
import Transmit from "react-transmit";
import Page from '../_components/page.jsx';
import ProjectForm from './components/project_form.jsx';

class ProjectActivatePage extends React.Component{
  render () {

    return (
       <Page {...this.props}>
          <ProjectForm action="activate" project={this.props.project} />
       </Page>
      );
  }
}

ProjectActivatePage.displayName = 'Project Activate Page';
ProjectActivatePage.propTypes = {
  project: React.PropTypes.object.isRequired,
  setQueryParams: React.PropTypes.func.isRequired
};
export default Transmit.createContainer(ProjectActivatePage, {
  queryParams: {},
  queries: {
  }
});

