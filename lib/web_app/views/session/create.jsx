'use strict';
import React from "react";
import Transmit from "react-transmit";
import LoginForm from "../_components/login.jsx";

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
LoginPage.displayName = 'Logn Page';



export default Transmit.createContainer(LoginPage, {
	queryParams: {},
	queries: {}
});
