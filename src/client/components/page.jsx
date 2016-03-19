import React, {Component, PropTypes} from 'react';
import {
  IDE,
  Menus,
  Console,
  Sidebar,
  Connectors,
  Layout,
  Loader,
  TextElements,
  FormElements
} from '@hoist/ui';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import {EditorActions, SessionActions} from '../actions';
import _ from 'lodash';

export class PageTemplate extends Component {
  constructor(props) {
    super(props);
  }
  logout() {
    this.props.history.pushState({}, '/logout');
  }
  render() {
    return (
      <IDE>
        <Helmet title='Overlord'/>
        <Menus.Navigation user={{
          name: 'jamie'
        }} application={{
          name: 'name'
        }} applications={[]} organisation={{
          name: "my org"
        }} organisations={[]} onLogout={this.logout} onOrganisationSelect={this.switchOrganisation} onApplicationSelect={this.switchApplication} onSwitchTheme={this.switchTheme} myAccount={this.myAccount} onWelcome={this.welcome} onAddApplication={this.createApplication} onAddOrganisation={this.createOrganisation}/>
        {this.props.children}
      </IDE>
    );
  }
};

export default connect(({
  user,
  organisation,
  application,
  events,
  connectors,
  applications,
  organisations,
  editor,
  console,
  settings
}) => ({
  user,
  application,
  organisation,
  events,
  connectors,
  applications,
  organisations,
  code: editor.current,
  selectedEvent: editor.currentEvent,
  console,
  settings
}), Object.assign({}, EditorActions, SessionActions))(PageTemplate);
