
var React = require('react');
var Header = React.createClass({
  render: function() {
    return (
      <section id='header'>
        <nav id="main-nav">
          <ul id="main-nav-menu">
            <li>
              <div id="home">
                <div className="logo">
                  Overlord
                </div>
              </div>
            </li>
            <li><a href="/projects">Projects</a></li>
            <li><a href="/servers">Servers</a></li>
            <li><a href="/servers">Queues</a></li>
            <li><a href="/users">Users</a></li>
          </ul>
        </nav>
        <div className='user-menu'>
          Owen <div className='icon icon-menu'/>
        </div>

      </section>
    );
  }
});

module.exports = Header;
