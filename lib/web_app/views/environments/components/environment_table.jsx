'use strict';
import React from 'react';
import Transmit from 'react-transmit';

class EnvironmentTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }
  render () {
    var body = 'No Environments';
    if (this.props.environments.length > 0) {
      body = (
          <table className="table table-striped">
            <thead className=''>
              <tr>
                <td>
                  Name
                </td>
                <td>
                  Fleet Url
                </td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {this.props.environments.map((environment) => {
            return (
                <tr>
                  <td>{environment.name}</td>
                  <td>{environment.fleetUrl}</td>
                  <td></td>
                </tr>
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
EnvironmentTable.displayName = 'Project Table';
EnvironmentTable.propTypes = {
  environments: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  setQueryParams: React.PropTypes.func
};

export
default Transmit.createContainer(EnvironmentTable, {
queryParams: {},
queries: {}
});
