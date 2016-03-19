'use strict';
import React from 'react';
class LoginForm extends React.Component {
  render() {
    return (
      <form className="form-horizontal" method="post">
        <div className='form-group'>
          <input className="form-control" id="username" name="username" placeholder="Username/Email Address" required type="email"/>
        </div>
        <div className="form-group">
            <input className="form-control" id="password" name="password" placeholder="Password" required type="password"/>
        </div>
        <div className="form-group">
          <div className="col-xs-offset-4 col-sm-4">
            <button className="btn btn-default" id="submit" type="submit" >Sign In</button>
          </div>
        </div>
      </form>
    );
  }
}
LoginForm.displayName = 'Login Form';
export default LoginForm;
