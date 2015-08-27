'use strict';
import React from "react";
import Transmit from "react-transmit";
import Page from '../_components/page.jsx';
import UserTable from './components/user_table.jsx';
import {}
from 'isomorphic-fetch';

class UserIndex extends React.Component {
  render () {

    return (
      <Page {...this.props}>
        <div className="container">
          <div className="panel">
            <h3 className="panel-heading">Users</h3>
            <div className="panel-body">
              <UserTable users={this.props.users} />
            </div>
          </div>
        </div>
      </Page>
    );
  }
}

UserIndex.displayName = 'Users Index Page';
UserIndex.propTypes = {
  users: React.PropTypes.arrayOf(React.PropTypes.object),
  setQueryParams: React.PropTypes.func.isRequired
};
export default Transmit.createContainer(UserIndex, {
  queryParams: {},
  queries: {
    users() {
      if (process && process.browser) {
        return global.fetch(`/api/users`, {
          credentials: 'include'
        }).then((response) => response.json());
      } else {
        return Promise.resolve([]);
      }
    }
  }
});


