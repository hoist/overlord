/** @jsx React.DOM */

var React = require('react');
var Header = require('../_partials/header');
var DefaultLayout = React.createClass({
  render: function() {
    return (
      <html>
        <link rel='stylesheet' href='./css/default.css'/>
        <head>
          <script src="//use.typekit.net/xtm5xsa.js"></script>
          <script dangerouslySetInnerHTML={{__html: 'try{Typekit.load();}catch(e){}'}}/>
          <title>{this.props.title}</title>
        </head>
        <body>
          <Header />
          <section id="main">{this.props.children}</section>
          <section id="footer"></section>
        </body>
      </html>
    );
  }
});

module.exports = DefaultLayout;
