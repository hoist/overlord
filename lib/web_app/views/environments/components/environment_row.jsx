'use strict';
import React from 'react';
class EnvironmentRow extends React.Component {
	constructor(props) {
		super(props);
		this.goToEdit = () => {
			global.location = '/environment/' + this.props.environment.slug;
		};
	}
	render() {
		return (
			<tr>
              <td>{this.props.environment.name}</td>
              <td>{this.props.environment.fleetUrl}</td>
              <td className="col-xs-2">
                <button className='btn pull-right' onClick={this.goToEdit}>Edit</button>
              </td>
            </tr>
		);
	}
}
EnvironmentRow.displayName = "Environmment Row";
EnvironmentRow.propTypes = {
	environment: React.PropTypes.object.isRequired
};
export default EnvironmentRow;
