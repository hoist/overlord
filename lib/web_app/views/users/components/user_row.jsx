'use strict';
import React from 'react';

class UserRow extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = () => {
      var location = `/user/${this.props.user._id}`;
      global.location = location;
    };
  }

  render() {
    return (
      <tr id={'user-row-' + this.props.user._id}>
        <td className="">
          {this.props.user.name}
        </td>
        <td className="">
          <button className="btn btn-success" onClick={this.handleClick}>View</button>
        </td>
      </tr>
    );
  }
}
UserRow.displayName = 'User Table Row';
UserRow.propTypes = {
  user: React.PropTypes.object.isRequired
};

export default UserRow;
