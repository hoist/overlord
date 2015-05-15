var React = require('react');
var MachineProperty = React.createClass({

  render: function(){
    console.log(this.props);
    function friendlyName(name) {
      switch(name) {
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
   return ( <div className="property">
        {friendlyName(this.props.propertyName)}: {this.props.propertyValue}
    </div>)
  }
})


var MachineView = React.createClass({

  render: function(){
    var _this = this;
    var machineProperties = Object.getOwnPropertyNames(this.props.machine.metadata).map(function (property, i) {
      return <MachineProperty propertyName={property} propertyValue={_this.props.machine.metadata[property]} key={i} />
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
      )
  }
});
module.exports = MachineView
