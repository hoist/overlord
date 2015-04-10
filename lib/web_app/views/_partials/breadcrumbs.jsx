/** @jsx React.DOM */

var React = require('react');
function logChange(val) {
  console.log("Selected: " + val);
}
var Breadcrumbs = React.createClass({
  render: function(){
    return (
      <div className="breadcrumbs container clear-fix">
        <span>
          {this.props.title}
        </span>
      </div>
      )
  }
});
module.exports = Breadcrumbs
