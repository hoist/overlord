'use strict';
import React from "react";
import Transmit from "react-transmit";
import Page from '../_components/page.jsx';

class ProjectIndex extends React.Component{
  render () {
    return (
       <Page {...this.props}>
          <div className="col col3">
          </div>
       </Page>
      );
  }
}

ProjectIndex.displayName = 'Project Index';
export default Transmit.createContainer(ProjectIndex, {
  queryParams: {},
  queries: {}
});
