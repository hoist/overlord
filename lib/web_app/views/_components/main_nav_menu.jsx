'use strict';
import React from 'react';

class MainNavMenu extends React.Component {
  render() {
     var navigation;
     if(this.props.authenticated){
      navigation = (
        [<li className={(this.props.controller === 'Projects') ? "active" : ""} key="projects"><a href="/projects">Projects</a></li>,
        <li className={(this.props.controller === 'Servers') ? "active" : ""} key="servers"><a href="/servers">Servers</a></li>,
        <li className={(this.props.controller === 'Queues') ? "active" : ""} key="queues"><a href="/queues">Queues</a></li>,
        <li className={(this.props.controller === 'Users') ? "active" : ""} key="users"><a href="/users">Users</a></li>]
              );
    }
    return (
      <ul className="nav left-options" id="main-nav-menu">
        <li>
          <div id="home">
            <div className="logo">
              Overlord
            </div>
          </div>
        </li>
        {navigation}
      </ul>
      );
  }
}

MainNavMenu.displayName = 'Main Nav Menu';
MainNavMenu.propTypes = {
  authenticated: React.PropTypes.bool.isRequired,
  controller: React.PropTypes.string.isRequired
};
export default MainNavMenu;
