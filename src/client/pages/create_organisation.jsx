import React, {Component, PropTypes} from 'react';
import {Page, Menus, Console, Sidebar} from '@hoist/ui';
import {connect} from 'react-redux';
import {OrganisationForm} from '../components/organisation_form';
import {OrganisationActions} from '../actions';
import {actions} from '../constants';
import Helmet from 'react-helmet';

export class CreateOrganisationPage extends Page {
  constructor (props) {
    super(props);
    this.createOrganisation = this
      .createOrganisation
      .bind(this);
  }
  createOrganisation (organisationDetails) {
    const {history} = this.context;
    const {location} = this.props;
    let nextPath = '/';
    this
      .props
      .createOrganisation(organisationDetails, () => {
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
          <OrganisationForm onSubmit={this.createOrganisation} status={this.props.status}/>
        </div>
      </Page>
    )
  }
}
CreateOrganisationPage.propTypes = {
  createOrganisation: PropTypes.func.isRequired,
  location: PropTypes.object,
  status: PropTypes.object
}
CreateOrganisationPage.contextTypes = {
  history: PropTypes.object.isRequired
}

export default connect(({location, action}) => ({
  location,
  status: action[actions.organisation.CREATE_ORGANISATION]
}), OrganisationActions)(CreateOrganisationPage);
