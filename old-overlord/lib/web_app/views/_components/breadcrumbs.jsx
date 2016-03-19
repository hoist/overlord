'use strict';
import React from 'react';

class Breadcrumbs extends React.Component {
  render() {
    let breadcrumbs = null;
    if (this.props.breadcrumbs) {
      breadcrumbs = this.props.breadcrumbs.map((breadcrumb, i) => {
        return (
          <li key={i}>
            <a href={breadcrumb.url}>
              {breadcrumb.name}
            </a>
          </li>
        );
      });
    }
    return (
      <div className="row">
        <ol className="breadcrumb">
          {breadcrumbs}
          <li className="active">
            {this.props.title}
          </li>
        </ol>
      </div>
    );
  }
}
Breadcrumbs.displayName = 'Breadcrumbs';
Breadcrumbs.propTypes = {
  breadcrumbs: React.PropTypes.arrayOf(React.PropTypes.object),
  title: React.PropTypes.string.isRequired
};

export default Breadcrumbs;
