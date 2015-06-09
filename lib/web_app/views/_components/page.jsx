'use strict';
import React from "react";
import Header from './header.jsx';
import BreadCrumbs from './breadcrumbs.jsx';
import _ from 'lodash';

class Page extends React.Component {
  render() {
    return (
      <div>
        <Header authenticated={this.props.authenticated} controller={this.props.controller} user={this.props.user} />
        <section className="container">
          <BreadCrumbs breadcrumbs={this.props.breadcrumbs} title={this.props.title}/>
        </section>
        <section className="container">
          {this.props.children}
        </section>
      </div>
    );
  }
}
Page.displayName = 'Page';
Page.propTypes = {
  authenticated: React.PropTypes.bool.isRequired,
  breadcrumbs: React.PropTypes.arrayOf(React.PropTypes.object),
  children: React.PropTypes.node.isRequired,
  controller: React.PropTypes.string,
  title: React.PropTypes.string.isRequired,
  user: React.PropTypes.string
};

export default Page;
