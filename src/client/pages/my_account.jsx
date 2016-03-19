import React, {PropTypes, Component} from 'react';
import {Menus, Views, Page, FormElements, Loader, Layout} from '@hoist/ui';
import {connect} from 'react-redux'
import {UserActions} from '../actions';
import {actions} from '../constants';
import Helmet from 'react-helmet';

export class MyAccount extends Component {
  constructor (props) {
    super(props);
    this.state = {
    };
  }
  render () {
    return (
      <Page>
        <Helmet title='Hoist: Editor'/>
        <Menus.Navigation 
          user={this.props.user} 
          application={this.props.application} 
          applications={this.props.applications}
          organisation={this.props.organisation} 
          organisations={this.props.organisations} 
          onLogout={this.logout} 
          onApplicationSelect={this.switchApplication} 
          onSwitchTheme={this.switchTheme} 
          myAccount={this.myAccount}
          onWelcome={this.welcome} />
      </Page>
    )
  }
}
MyAccount.propTypes = {
}
MyAccount.contextTypes = {
  history: PropTypes.object.isRequired
}

// export default connect(
// // Use a selector to subscribe to state
// ({router, action}) => ({
//   location: router.location,
//   status: action[actions.session.LOGGED_IN]
// }), UserActions)(MyAccount);

export default connect(({
  user,
  applications,
  organisations,
  router,
  action
}) => ({
  user,
  applications,
  organisations,
  location: router.location,
  status: action[actions.session.LOGGED_IN]
}), UserActions)(MyAccount);
