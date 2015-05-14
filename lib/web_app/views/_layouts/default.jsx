var React = require('react');
var Header = require('../_components/header.jsx');
var BreadCrumbs = require('../_components/breadcrumbs.jsx');

var DefaultLayout = React.createClass({
  render: function() {
    var { children, ...other } = this.props;
    function createTemplateCall(){
      return {
        __html:`var React = require('react');
                var View = require('view');
                React.render(React.createElement(View,`+JSON.stringify({...other})+`),document.documentElement);`
      }
    }
    return (
      <html>
        <meta charSet="utf-8"/>
        <link rel='stylesheet' href='/css/default.css'/>
        <head>
          <script src="//use.typekit.net/xtm5xsa.js"></script>
          <script dangerouslySetInnerHTML={{__html: 'try{Typekit.load();}catch(e){}'}}/>
          <title>{this.props.title}</title>
        </head>
        <body>
          <Header {...other} />
          <BreadCrumbs title={this.props.title} />
          <section id="main" className="container clear-fix">{this.props.children}</section>
          <section id="footer clear-fix">
            <script src={"/templates/"+this.props.template}></script>
            <script dangerouslySetInnerHTML={createTemplateCall()}/>
          </section>
        </body>
      </html>
    );
  }
});
module.exports = DefaultLayout;
