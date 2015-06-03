'use strict';
import React from "react";

class EnvironmentForm extends React.Component {
    handleSubmit(e) {
        e.preventDefault();
        var name = React.findDOMNode(this.refs.name).value.trim();
        var fleetUrl = React.findDOMNode(this.refs.name).value.trim();
    }

    render() {
        let nameGroupClasses = React.addons.classSet({
            'form-group': true,
            'has-error': this.props.errors.name,
            'has-feedback': this.props.errors.name
        });
        let fleetUrlGroupClasses = React.addons.classSet({
            'form-group': true,
            'has-error': this.props.errors.fleetUrl,
            'has-feedback': this.props.errors.fleetUrl
        });

        return (
            <form className="form-horizontal" onSubmit={this.handleSubmit}>
                <div className={nameGroupClasses}>
                    <label className="control-label col-sm-2" htmlFor="name">Name</label>
                    <div className="col-sm-10">
                        <input aria-describedby="nameStatus" className='form-control' defaultValue={this.props.environment.name} id="name" placeholder="name" ref="name" required="true" />
                        <span aria-hidden="true" className="glyphicon glyphicon-remove form-control-feedback"></span>
                        <span className="sr-only" id="nameStatus">{this.props.errors.name}</span>
                    </div>
                </div>
                <div className={fleetUrlGroupClasses}>
                    <label className="control-label col-sm-2" htmlFor="fleetUrl">Fleet URL:</label>
                    <div className="col-sm-10">
                        <input aria-describedby="fleetUrlStatus" className='form-control' defaultValue={this.props.environment.fleetUrl} id="fleetUrl" placeholder="http://someurl:3001" ref="fleetUrl" required="true"/>
                        <span aria-hidden="true" className="glyphicon glyphicon-remove form-control-feedback"></span>
                        <span className="sr-only" id="fleetUrlStatus">{this.props.errors.fleetUrl}</span>
                    </div>
                </div>
                 <div className="form-group">
                    <div className="col-sm-offset-2 col-sm-10 btn-group">
                      <button className="btn btn-default">Cancel</button>
                      <button className="btn btn-success" type="submit">Save</button>
                    </div>
                </div>
            </form>
        );
    }
}

EnvironmentForm.displayName = 'Environment Form';
EnvironmentForm.propTypes = {
    environment: React.PropTypes.object.isRequired,
    errors: React.PropTypes.object
};

export default EnvironmentForm;
