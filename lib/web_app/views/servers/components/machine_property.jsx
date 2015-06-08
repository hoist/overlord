'use strict';
import React from 'react';
class MachineProperty extends React.Component {
  render() {
    function friendlyName(name) {
      switch (name) {
      case 'aws_az':
        return 'AWS Zone';
      case 'consul_role':
        return 'Consul Role';
      case 'container_type':
        return 'Container Types';
      case 'ec2_id':
        return 'EC2 Instance Id';
      default:
        return name;
      }
    }
    return (
      <div className="property">
        {friendlyName(this.props.propertyName)}: {this.props.propertyValue}
      </div>
    );
  }
}
MachineProperty.displayName = "Machine Property";
MachineProperty.propTypes = {
  propertyName: React.PropTypes.string.isRequired,
  propertyValue: React.PropTypes.string.isRequired
};

export
default MachineProperty;
