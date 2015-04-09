/** @jsx React.DOM */

var React = require('react');
var DefaultLayout = require('../_layouts/default');
var ProjectsList = React.createClass({
  render: function () {
    var properties = this.props;
    return (
      <DefaultLayout {...this.props}>
        <div className="col col3">
          <div className="clear-fix">
            <a href="/projects/create" className="button create right">
              Add
            </a>
          </div>
          <div className="panel">
            <div className="head">Projects</div>
            <div className="body">
              {this.props.controller}
            </div>
          </div>
        </div>
      </DefaultLayout>
      );
  }
});

module.exports = ProjectsList;
