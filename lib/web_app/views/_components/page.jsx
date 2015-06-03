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
                <section className="container">
                    <BreadCrumbs breadcrumbs={this.props.breadcrumbs} title={this.props.title} />
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
    breadcrumbs: React.PropTypes.arrayOf(React.PropTypes.object),
    children: React.PropTypes.node.isRequired,
    title: React.PropTypes.string.isRequired
};

export default Page;
