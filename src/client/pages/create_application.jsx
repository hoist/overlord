import React, {Component, PropTypes} from 'react';
import {Page, Menus, Console, Sidebar} from '@hoist/ui';
import {connect} from 'react-redux';
import {ApplicationForm} from '../components/application_form';
import {ApplicationActions} from '../actions';
import {actions} from '../constants';
import Helmet from 'react-helmet';
export class CreateApplicationPage extends Component {
  constructor (props) {
    super(props);
    this.createApplication = this
      .createApplication
      .bind(this);
  }
  createApplication (applicationDetails) {
    const {history} = this.context;
    const {location} = this.props;
    let nextPath = '/';
    this
      .props
      .createApplication(applicationDetails, () => {
        // redirect to a secure page
        history.pushState({}, nextPath)
      });
  }
  render () {
    return (
      <Page>
        <Helmet title="Hoist: Create Organisation"/>
        <div className="login-box" style={{
          position:'absolute',
          top:'50%',
          left:'50%',
          transform:'translate(-50%, -50%)'
        }}>
          <ApplicationForm onSubmit={this.createApplication} status={this.props.status}/>
        </div>
      </Page>
    )
  }
}
CreateApplicationPage.propTypes = {
  createApplication: PropTypes.func.isRequired,
  location: PropTypes.object,
  status: PropTypes.object
}
CreateApplicationPage.contextTypes = {
  history: PropTypes.object.isRequired
}

export default connect(({location, action}) => ({
  location,
  status: action[actions.application.CREATE_APPLICATION]
}), ApplicationActions)(CreateApplicationPage);
