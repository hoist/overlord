'use strict';
import React from 'react';
import UserRow from './user_row.jsx';
import {
  sortByAll
}
from 'lodash';
class UserTable extends React.Component {
  render() {
    return (
      <table className="table table-hover table-striped">
        <thead>
          <tr>
            <th className="col-xs-10">
              User Name
            </th>
            <th className="col-xs-2">
            </th>
          </tr>
        </thead>
        <tbody>
          {
            this.props.users.map((user, i) => {
              return <UserRow key={i} user={user} />;
            })
          }
        </tbody>
      </table>
    );
  }
}
UserTable.displayName = 'User Table';
UserTable.propTypes = {
  users: React.PropTypes.arrayOf(React.PropTypes.object)
};

export default UserTable;
