/** @jsx React.DOM */

var React = require('react');
var Header = React.createClass({
  render: function() {
    return (
      <section id='header'>
        <nav id="main-nav">
          <ul id="main-nav-menu" className="nav left-options">
            <li>
              <div id="home">
                <div className="logo">
                  Overlord
                </div>
              </div>
            </li>
            <li className={(this.props.controller==='Projects')?"active":""}><a href="/projects">Projects</a></li>
            <li className={(this.props.controller==='Servers')?"active":""}><a href="/servers">Servers</a></li>
            <li className={(this.props.controller==='Queues')?"active":""}><a href="/queues">Queues</a></li>
            <li className={(this.props.controller==='Users')?"active":""}><a href="/users">Users</a></li>
          </ul>
          <ul id="secondary-menu" className="nav right-options">
            <li className="line-break line-break-profile">
              &nbsp;
            </li>
            <li>
              <a href="javascript:" className="menu-option">
                Owen Evans
                <span className="icon icon-menu-dropdown"/>
              </a>
            </li>
          </ul>
        </nav>
      </section>
    );
  }
});

module.exports = Header;
