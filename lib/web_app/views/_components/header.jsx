var React = require('react');
var NavMenu = React.createClass({
  render: function(){
     var navigation;
     if(this.props.authenticated){
      navigation = (
        [<li key="projects" className={(this.props.controller==='Projects')?"active":""}><a href="/projects">Projects</a></li>,
        <li key="servers" className={(this.props.controller==='Servers')?"active":""}><a href="/servers">Servers</a></li>,
        <li key="queues" className={(this.props.controller==='Queues')?"active":""}><a href="/queues">Queues</a></li>,
        <li key="users" className={(this.props.controller==='Users')?"active":""}><a href="/users">Users</a></li>]
              );
    }
    return (
      <ul id="main-nav-menu" className="nav left-options">
        <li>
          <div id="home">
            <div className="logo">
              Overlord
            </div>
          </div>
        </li>
        {navigation}
      </ul>
      );
  }
})
var UserMenu = React.createClass({
  getInitialState: function () {
    return {
      expanded: false
    };
  },
  toggleMenu: function (e) {
    this.setState({expanded:!this.state.expanded});
  },
  render: function(){
    if(this.props.authenticated){
      return (<ul id="secondary-menu" className="nav right-options">
            <li className="line-break line-break-profile">
              &nbsp;
            </li>
            <li>
              <a href="javascript:" className="menu-option" onClick={this.toggleMenu}>
                {this.props.user}
                <span className="icon icon-menu-dropdown"/>
              </a>
              <ul className={this.state.expanded?'':'hidden'}>
                <li>
                  <a href="/session/destroy">Sign Out</a>
                </li>
              </ul>
            </li>
          </ul>);
    }
    else{
      return false;
    }
  }
})
var Header = React.createClass({
  render: function() {
    return (
      <section id='header'>
        <nav id="main-nav">
          <NavMenu {...this.props}/>
          <UserMenu {...this.props}/>
        </nav>
      </section>
    );
  }
});

module.exports = Header;
