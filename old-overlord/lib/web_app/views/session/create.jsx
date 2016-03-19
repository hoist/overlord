'use strict';
import React from "react";
import Transmit from "react-transmit";
import LoginForm from "./components/login.jsx";

class LoginPage extends React.Component {
    render() {
        return (
        <div className="container">
            <div className="login-panel panel panel-default col-xs-offset-3 col-xs-6">
                <div className="panel-heading">
                    <img className="login-icon" />
                </div>
                <div className="panel-body">
                    <LoginForm />
                </div>
            </div>
         </div>
        );
    }
}
LoginPage.displayName = 'Login Page';

export default Transmit.createContainer(LoginPage, {
    queryParams: {},
    queries: {}
});
