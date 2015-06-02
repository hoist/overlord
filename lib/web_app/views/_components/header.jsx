'use strict';
import React from 'react';
import UserDropdownMenu from './user_dropdown_menu.jsx';
import MainNavMenu from './main_nav_menu.jsx';
class Header extends React.Component {
  render() {
    return (
      <header className="navbar navbar-inverse navbar-static-top" role="banner">
        <div className="container">
         <nav className="collapse navbar-collapse">
            <div className='navbar-header'>
              <a className="navbar-brand" href="/">
                <img alt="overlord" src="/img/herbert.png" />
              </a>
            </div>
            <MainNavMenu authenticated={this.props.authenticated} controller={this.props.controller}/>
            <UserDropdownMenu authenticated={this.props.authenticated} user={this.props.user}/>
          </nav>
        </div>
      </header>
    );
  }
}
Header.displayName = "Header";
Header.propTypes = {
  authenticated: React.PropTypes.bool.isRequired,
  controller: React.PropTypes.string,
  user: React.PropTypes.string
};

module.exports = Header;
