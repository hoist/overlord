'use strict';
import React from "react";
import Transmit from "react-transmit";
import LoginForm from "./components/login.jsx";

class LoginPage extends React.Component {
  render () {
    return (
      <section className="container ua-form clear-fix" id="main">
        <a className="logo" href="/"></a>
        <LoginForm />
      </section>
    );
  }
}
LoginPage.displayName = 'Login Page';

export
default Transmit.createContainer(LoginPage, {
queryParams: {},
queries: {}
});
