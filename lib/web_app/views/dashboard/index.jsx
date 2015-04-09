/** @jsx React.DOM */

var React = require('react');
console.log(__dirname);
var DefaultLayout = require('../_layouts/default');
var HelloMessage = React.createClass({
  render: function () {
    return (
      <DefaultLayout title="test">
      <div>Hello there {this.props.name}</div>
      </DefaultLayout>
      );
  }
});

module.exports = HelloMessage;
