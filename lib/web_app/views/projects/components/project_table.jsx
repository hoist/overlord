'use strict';
import React from 'react';
import ProjectRow from './project_row.jsx';
import Transmit from 'react-transmit';

class ProjectTable extends React.Component {
  componentWillMount() {
    if (process && process.browser) {
      this.props.setQueryParams({
        status: this.props.status
      }).then(() => {
        this.setState({
          loading: false
        });
      });
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }
  render () {
    var body;
    if (this.state.loading || !this.props.projects) {
      body = (
          <h3>Loading...</h3>
      );
    } else if (this.props.projects.length === 0) {
      body = (
          <h3>No Projects</h3>
      );
    } else {
      var rows = this.props.projects.map((project, key) => {
        return <ProjectRow key={key} project={project}/>;
      });
      body = ({
        rows
      });
    }
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          Projects: {this.props.status}
        </div>
        <div className="panel-body">
          {body}
        </div>
      </div>

    );
  }
}
ProjectTable.displayName = 'Project Table';
ProjectTable.propTypes = {
  projects: React.PropTypes.arrayOf(React.PropTypes.object),
  setQueryParams: React.PropTypes.func,
  status: React.PropTypes.string.isRequired
};

export
default Transmit.createContainer(ProjectTable, {
queryParams: {},
queries: {
  projects(queryParams) {
    if (queryParams.status) {
      return global.fetch(`/api/projects?status=${queryParams.status}`, {
        credentials: 'include'
      }).then((response) => response.json());
    } else {
      return Promise.resolve([]);
    }
  }
}
});
