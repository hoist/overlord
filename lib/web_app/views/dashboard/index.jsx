/** @jsx React.DOM */

var React = require('react');
var DefaultLayout = require('../_layouts/default.jsx');
var Dashboard = React.createClass({
  render: function () {
    var properties = this.props;
    return (
      <DefaultLayout {...this.props}>
        <div className="col col3">
          <div className="panel">
            <div className="head">Welcome</div>
            <div className="body">
              Welcome to my lair underling <br/>
              Choose your adventure: <br/>
              <a href="/projects">Check out the projects and their deploys</a><br/>
              <a href="/servers">Check out the currently running servers</a><br/>
              <a href="/queues">Check out the job queues</a><br/>
              <a href="/users">Check out the users</a>
            </div>
          </div>
        </div>
      </DefaultLayout>
      );
  }
});

module.exports = Dashboard;
