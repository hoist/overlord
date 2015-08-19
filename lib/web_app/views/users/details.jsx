'use strict';
import React from "react";
import Transmit from "react-transmit";
import Page from '../_components/page.jsx';

class DetailsPage extends React.Component {
  render () {

    return (
      <Page {...this.props}>
        <div className="container">
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


