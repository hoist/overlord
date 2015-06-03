'use strict';
import React from 'react';

class MainNavMenu extends React.Component {
  render() {
    var navigation = [];
    if (this.props.authenticated) {
      navigation = ['Projects', 'Servers', 'Queues', 'Users', 'Environments'];
    }

    return (
      <ul className="nav navbar-nav">
      {
        navigation.map((controller, i) => {
          return <li className={(this.props.controller === controller) ? "active" : ""} key={i}><a href={'/' + controller.toLowerCase()}>{controller}</a></li>;
        })
      }
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
