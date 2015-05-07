var React = require('react');
var LoginForm = React.createClass({
  render: function(){
    return (
        <div className="form">
          <div className = "form-group">
            <form method="post" className="login-form">
              <input id="username" type="email" name="username" placeholder="Username/Email Address" required/>
              <input id="password" type="password" name="password" placeholder="Password" required/>
              <input type="submit" id="submit" value="Sign In"/>
            </form>
          </div>
        </div>
      )
  }
});
module.exports = LoginForm
