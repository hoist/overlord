'use strict';
import React from "react";
import Header from './header.jsx';
import BreadCrumbs from './breadcrumbs.jsx';
import _ from 'lodash';

class Page extends React.Component {
    render() {
        let otherProps = _.omit(this.props, 'children');
        return (
            <div>
                <Header {...otherProps}/>
                <BreadCrumbs title={this.props.title} />
                <section className="container clear-fix" id="main">
                    {this.props.children}
                </section>
            </div>
        );
    }
}

Page.displayName = 'Page';
Page.propTypes = {
    children: React.PropTypes.object.isRequired,
    title: React.PropTypes.string.isRequired
};

export default Page;
