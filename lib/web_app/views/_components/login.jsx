'use strict';
import React from 'react';
class LoginForm extends React.Component {
  render(){
    return (
        <div className="form">
          <div className = "form-group">
            <form className="login-form" method="post">
              <input id="username" name="username" placeholder="Username/Email Address" required type="email"/>
              <input id="password" name="password" placeholder="Password" required type="password"/>
              <input id="submit" type="submit" value="Sign In"/>
            </form>
          </div>
        </div>
      );
  }
}
LoginForm.displayName = 'Login Form';
export default LoginForm;
