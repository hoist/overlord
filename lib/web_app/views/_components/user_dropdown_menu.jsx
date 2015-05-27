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
    if(this.props.authenticated){
      return (
        <ul className="nav right-options" id="secondary-menu">
            <li className="line-break line-break-profile">
              &nbsp;
            </li>
            <li>
              <a className="menu-option" onClick={this.toggleMenu}>
                {this.props.user}
                <span className="icon icon-menu-dropdown"/>
              </a>
              <ul className={this.state.expanded ? '' : 'hidden'}>
                <li>
                  <a href="/session/destroy">Sign Out</a>
                </li>
              </ul>
            </li>
         </ul>
        );
    }
    else{
      return false;
    }
  }
}

UserDropdownMenu.displayName = "User Dropdown Menu";
UserDropdownMenu.propTypes = {
    authenticated: React.PropTypes.bool.isRequired,
    user: React.PropTypes.string
};

export default UserDropdownMenu;
