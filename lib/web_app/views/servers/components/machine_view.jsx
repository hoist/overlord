'use strict';
import React from 'react';
import MachineProperty from './machine_property.jsx';

class MachineView extends React.Component {

  render () {
    var _this = this;
    var machineProperties = Object.getOwnPropertyNames(this.props.machine.metadata).map((property, i) => {
      return <MachineProperty key={i} propertyName={property} propertyValue={_this.props.machine.metadata[property]}/>;
    });
    return (
      <div className="machine box">
        <div className="header">
          {this.props.machine.ip}
        </div>
        <div className="body">
          {machineProperties}
        </div>
      </div>
    );
  }
}
MachineView.displayName = 'Machine View';
MachineView.propTypes = {
  machine: React.PropTypes.object.isRequired
};

export
default MachineView;
