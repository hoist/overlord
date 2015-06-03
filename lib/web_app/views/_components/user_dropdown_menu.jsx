'use strict';
import React from 'react';

class UserDropdownMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
    this.toggleMenu = () => {

      this.setState({
        expanded: !this.state.expanded
      });
    };
  }
  render() {
    if (this.props.authenticated) {
      return (
        <ul className="nav navbar-right navbar-nav" id="secondary-menu">
          <li className="divider">
            &nbsp;
          </li>
          <li className={this.state.expanded ? 'dropdown open' : 'dropdown'}>
            <a aria-expanded={this.state.expanded ? 'true' : 'false'} className="dropdown-toggle" onClick={this.toggleMenu} role="button">
              {this.props.user}
              <span className="caret"></span>
            </a>
            <ul className='dropdown-menu' role="menu">
              <li>
                <a href="/session/destroy">Sign Out</a>
              </li>
            </ul>
          </li>
        </ul>
      );
    } else {
      return false;
    }
  }
}
UserDropdownMenu.displayName = "User Dropdown Menu";
UserDropdownMenu.propTypes = {
  authenticated: React.PropTypes.bool.isRequired,
  user: React.PropTypes.string
};

export
default UserDropdownMenu;
