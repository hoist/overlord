var React = require('react');
var UnauthenticatedLayout = React.createClass({
  render: function() {
    return (
      <html>
        <meta charSet="utf-8"/>
        <link rel='stylesheet' href='/css/default.css'/>
        <head>
          <script src="//use.typekit.net/xtm5xsa.js"></script>
          <script dangerouslySetInnerHTML={{__html: 'try{Typekit.load();}catch(e){}'}}/>
          <title>{this.props.title}</title>
        </head>
        <body className="unauthenticated">
            {this.props.children}
        </body>
      </html>
    );
  }
});

module.exports = UnauthenticatedLayout;
