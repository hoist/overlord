'use strict';
import React from 'react';
import Transmit from 'react-transmit';
import EnvironmentRow from './environment_row.jsx';
class EnvironmentTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }
  render() {
    var body = 'No Environments';
    if (this.props.environments.length > 0) {
      body = (
        <table className="table table-striped">
            <thead className=''>
              <tr>
                <th>
                  Name
                </th>
                <th collSpan="2">
                  Fleet Url
                </th>
              </tr>
            </thead>
            <tbody>
              {this.props.environments.map((environment, i) => {
            return (
               <EnvironmentRow environment={environment} key={i} />
            );
          })}
            </tbody>
          </table>

      );
    }
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          Environments
        </div>
        <div className="panel-body">
          {body}
        </div>
      </div>

    );
  }
}
EnvironmentTable.displayName = 'Environments Table';
EnvironmentTable.propTypes = {
  environments: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  setQueryParams: React.PropTypes.func
};

export
default Transmit.createContainer(EnvironmentTable, {
  queryParams: {},
  queries: {}
});
