'use strict';
import React from 'react';
import UserDropdownMenu from './user_dropdown_menu.jsx';
import MainNavMenu from './main_nav_menu.jsx';
class Header extends React.Component {
  render() {
    return (
      <section className='page-header' id='header'>
        <nav id="main-nav">
          <MainNavMenu authenticated={this.props.authenticated} controller={this.props.controller}/>
          <UserDropdownMenu authenticated={this.props.authenticated} user={this.props.user}/>
        </nav>
      </section>
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
