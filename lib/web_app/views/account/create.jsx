'use strict';
import React from "react";
import Transmit from "react-transmit";

class CreateAccountPage extends React.Component {
    render() {
        return (
        <div className="container">
            <div className="login-panel panel panel-default col-xs-offset-3 col-xs-6">
                <div className="panel-heading">
                    <img className="login-icon" />
                </div>
                <div className="panel-body">
                </div>
            </div>
         </div>
        );
    }
}
CreateAccountPage.displayName = 'Create Account Page';

export default Transmit.createContainer(CreateAccountPage, {
    queryParams: {},
    queries: {}
});
