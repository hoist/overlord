'use strict';
import React from "react";
import Transmit from "react-transmit";
import Page from '../_components/page.jsx';

class DetailsPage extends React.Component {
  render () {
    function createMarkup (fields) {
      return {__html: JSON.stringify(fields)}; 
    }

    return (
      <Page {...this.props}>
        <div className="container">
          <h3>User</h3>
          <pre dangerouslySetInnerHTML={createMarkup(this.props.rawUser)}></pre>
          <h3>Organisations</h3>
          <pre dangerouslySetInnerHTML={createMarkup(this.props.organisations)}></pre>
          <h3>Applications</h3>
          <pre dangerouslySetInnerHTML={createMarkup(this.props.applications)}></pre>
        </div>
      </Page>
    );
  }
}

DetailsPage.displayName = 'User Details Page';
DetailsPage.propTypes = {
  user: React.PropTypes.object.isRequired,
  setQueryParams: React.PropTypes.func.isRequired
};
export default Transmit.createContainer(DetailsPage, {
  queryParams: {},
  queries: {}
});


