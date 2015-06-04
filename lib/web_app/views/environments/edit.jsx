'use strict';
import React from "react";
import Transmit from "react-transmit";
import Page from '../_components/page.jsx';
import EnvironmentForm from './components/environment_form.jsx';
class NewEnvironment extends React.Component {
  render () {
    return (
      <Page {...this.props}>
        <EnvironmentForm initialEnvironment={this.props.environment}/>
      </Page>
    );
  }
}
NewEnvironment.displayName = 'Edit Environment Page';
NewEnvironment.propTypes = {
  environment: React.PropTypes.object.isRequired,
  setQueryParams: React.PropTypes.func.isRequired
};
export
default Transmit.createContainer(NewEnvironment, {
queryParams: {},
queries: {}
});
