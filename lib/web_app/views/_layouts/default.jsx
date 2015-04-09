/** @jsx React.DOM */

var React = require('react');
var Header = require('../_partials/header');
var BreadCrumbs = require('../_partials/breadcrumbs');
var DefaultLayout = React.createClass({
  render: function() {
    return (
      <html>
        <meta charSet="utf-8"/>
        <link rel='stylesheet' href='./css/default.css'/>
        <head>
          <script src="//use.typekit.net/xtm5xsa.js"></script>
          <script dangerouslySetInnerHTML={{__html: 'try{Typekit.load();}catch(e){}'}}/>
          <title>{this.props.title}</title>
        </head>
        <body>
          <Header {...this.props} />
          <BreadCrumbs title={this.props.title} />
          <section id="main" className="container clear-fix">{this.props.children}</section>
          <section id="footer clear-fix"></section>
        </body>
      </html>
    );
  }
});

module.exports = DefaultLayout;
