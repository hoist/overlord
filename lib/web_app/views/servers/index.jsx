var React = require('react');
var MachineView = require('../_components/machine_view.jsx');
var DefaultLayout = require('../_layouts/default.jsx');
var ProjectsIndex = React.createClass({
  render: function () {
    var properties = this.props;
    var machineViews = this.props.machines.map(function (machine, i) {
          return <MachineView machine={machine} key={i} />
        });
    return (
      <DefaultLayout {...this.props}>
        <div className="col col3">
          <div className="panel">
            <div className="head">Servers</div>
            <div className="body">
              {machineViews}
            </div>
          </div>
        </div>
      </DefaultLayout>
      );
  }
});

module.exports = ProjectsIndex;
