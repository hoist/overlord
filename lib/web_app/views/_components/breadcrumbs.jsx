'use strict';
import React from 'react';

class Breadcrumbs extends React.Component{
  render (){
    let breadcrumbs = null;
    if(this.props.breadcrumbs){
      breadcrumbs = this.props.breadcrumbs.map((breadcrumb, i)=>{
        return (
          <span className="breadcrumb" key={i}>
            <a href={breadcrumb.url}>
              {breadcrumb.name}
            </a>
            &raquo;
          </span>
          );
      });
    }
    return (
      <div className="breadcrumbs container clear-fix">
        {breadcrumbs}
        <span>
          {this.props.title}
        </span>
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
