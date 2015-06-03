'use strict';
import React from "react";
import Transmit from "react-transmit";
import Page from '../_components/page.jsx';
import EnvironmentTable from './components/environment_table.jsx';

class EnvironmentIndex extends React.Component {
  render () {
    return (
      <Page {...this.props}>
        <div className="container">
          <EnvironmentTable environments={this.props.environments}/>
        </div>
        <a className="btn btn-success pull-right" href="/environment/new" role="button">Add an Environment</a>
      </Page>
    );
  }
}
EnvironmentIndex.displayName = 'Environment Index Page';
EnvironmentIndex.propTypes = {
  environments: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  setQueryParams: React.PropTypes.func.isRequired
};
export
default Transmit.createContainer(EnvironmentIndex, {
queryParams: {},
queries: {}
});
