var React = require('react');
var UnauthenticatedLayout = require('../_layouts/unauthenticated.jsx');
var LoginForm = require('../_components/login.jsx');
var LoginPage = React.createClass({
  render: function () {
    var properties = this.props;
    return (
      <UnauthenticatedLayout {...this.props}>
        <section id="main" className="container ua-form clear-fix">
          <a className="logo" href="/"></a>
          <LoginForm />
        </section>
      </UnauthenticatedLayout>
      );
  }
});

module.exports = LoginPage;
