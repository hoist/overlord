import React, {PropTypes, Component} from 'react';
import {Views, Page, FormElements, Loader} from '@hoist/ui';
import {connect} from 'react-redux'
import {SessionActions, UserActions} from '../actions';
import {actions} from '../constants';
//import normalize from '../styles/normalize.scss';
import logincss from '../styles/login.scss';
import Helmet from 'react-helmet';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleSignup = this.handleSignup.bind(this);
    this.handleForgotPassword = this.handleForgotPassword.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      loading: false,
      mode: props.page || 'login'
    };
  }
  handleLogin(evt, state) {

    this.setState({loading: true});

    evt.preventDefault();
    const {history} = this.context;
    const {location} = this.props;
    let nextPath = '/';
    if (location.state && location.state.nextPathname) {
      nextPath = location.state.nextPathname;
    }
    this.props.login(state, (result) => {
      // redirect to a secure page
      history.pushState({}, nextPath)
    }, () => {
      this.setState({loading: false});
    });

  }
  handleSignup(evt, state) {
    this.setState({loading: true});
    evt.preventDefault();
    const {history} = this.context;
    const {location} = this.props;
    let nextPath = '/';
    if (location.state && location.state.nextPathname) {
      nextPath = location.state.nextPathname;
    }
    this.props.signup(state, (result) => {
      // redirect to a secure page
      history.pushState({}, nextPath)
    }, () => {
      this.setState({loading: false});
    });
  }
  handleForgotPassword(evt, state) {
    this.setState({loading: true});
    evt.preventDefault();
    let form = Object.assign({}, state, {activationKey: this.props.activationKey});
    const {history} = this.context;
    const {location} = this.props;
    let nextPath = '/login';
    if (location.state && location.state.nextPathname) {
      nextPath = location.state.nextPathname;
    }
    this.props.forgotPassword(form, (result) => {
      this.setState({mode: 'login', loading: false});
      history.pushState({}, nextPath)
    }, () => {
      this.setState({loading: false});
    });
  }
  handleChange(mode) {
    this.setState({mode: mode});
  }
  render() {
    return (
      <Page>
        <Helmet title="Hoist: Login"/>
        <div className="login-container ads style-1">
          <Views.Login activationKey={this.props.activationKey} loading={this.state.loading} mode={this.state.mode} status={this.props.status} onModeChange={this.handleChange} onLogin={this.handleLogin} onSignup={this.handleSignup} onForgotPassword={this.handleForgotPassword}/>
        </div>
      </Page>
    )
  }
}
LoginPage.propTypes = {
  page: PropTypes.string,
  login: PropTypes.func.isRequired,
  signup: PropTypes.func.isRequired,
  forgotPassword: PropTypes.func.isRequired,
  location: PropTypes.object,
  status: PropTypes.object,
  activationKey: PropTypes.string
}
LoginPage.contextTypes = {
  history: PropTypes.object.isRequired
}

export
default connect(
// Use a selector to subscribe to state
({
  router,
  action
}, ownProps) => {
  let params = router.params || {};
  return ({
    page: ownProps.route.path,
    location: router.location,
    status: action[actions.session.LOGGED_IN],
    activationKey: params.activationKey
  });
}, Object.assign({}, SessionActions, UserActions))(LoginPage);
