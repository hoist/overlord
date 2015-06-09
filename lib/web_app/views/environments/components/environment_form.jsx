'use strict';
import React from 'react';
import classnames from 'classnames';
import {}
from 'isomorphic-fetch';

class EnvironmentForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      environment: props.initialEnvironment,
      errors: {}
    };
    this.handleSubmit = (e) => {
      e.preventDefault();
      var name = React.findDOMNode(this.refs.name).value.trim();
      var fleetUrl = React.findDOMNode(this.refs.fleetUrl).value.trim();
      var _id = React.findDOMNode(this.refs._id).value.trim();
      var slug = React.findDOMNode(this.refs.slug).value.trim();
      var environment = {
        _id: _id,
        slug: slug,
        name: name,
        fleetUrl: fleetUrl
      };
      this.saveEnvironment(environment);
    };
  }
  handleCancel(e) {
    e.preventDefault();
    global.location = '/environments';
  }
  saveEnvironment(environment) {
    let method = 'post';
    let path = '/api/environment';
    if (environment.slug) {
      //make this an update
      method = 'put';
      path = `/api/environment/${environment.slug}`;
    }
    return global.fetch(path, {
      credentials: 'include',
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(environment)
    }).then((response) => {
      return response.json();
    }).then((response) => {
      //presence of response.statuscode indicates a non 200 response
      if (response.statusCode) {
        this.setState({
          environment: environment,
          errors: response.errors || {}
        });
      } else {
        global.location = `/environment/${response.slug}`;
      }
    }).catch((err) => {
      console.log('error', err);
    });
  }

  render() {
    let nameGroupClasses = classnames({
      'form-group': true,
      'has-error': this.state.errors.name,
      'has-feedback': this.state.errors.name
    });
    let fleetUrlGroupClasses = classnames({
      'form-group': true,
      'has-error': this.state.errors.fleetUrl,
      'has-feedback': this.state.errors.fleetUrl
    });

    let feedbackIconClasses = {
      "glyphicon": true,
      "glyphicon-remove": true,
      "form-control-feedback": true
    };
    let fleetUrlFeedbackIconClasses = classnames(feedbackIconClasses, {
      "hidden": !(this.state.errors.fleetUrl)
    });
    let nameFeedbackIconClasses = classnames(feedbackIconClasses, {
      "hidden": !(this.state.errors.name)
    });
    let nameAlertClasses = classnames({
      "col-sm-10": true,
      "col-sm-offset-2": true,
      "alert": true,
      "alert-danger": true,
      "hidden": !(this.state.errors.name)
    });
    let fleetUrlAlertClasses = classnames({
      "col-sm-10": true,
      "col-sm-offset-2": true,
      "alert": true,
      "alert-danger": true,
      "hidden": !(this.state.errors.fleetUrl)
    });

    return (
      <form className="form-horizontal" onSubmit={this.handleSubmit}>
        <input aria-hidden="true" defaultValue={this.state.environment._id} id="_id" ref="_id" type="hidden"/>
        <input aria-hidden="true" defaultValue={this.state.environment.slug} id="slug" ref="slug" type="hidden"/>
        <div className={nameGroupClasses}>
          <div className={nameAlertClasses} role="alert">
            <span aria-hidden="true" className="glyphicon glyphicon-exclamation-sign"></span>
            <span className="sr-only">Error:</span>
            {(this.state.errors.name) ? this.state.errors.name.message : '' }
          </div>
          <label className="control-label col-sm-2" htmlFor="name">Name</label>
          <div className="col-sm-10">
            <input aria-describedby="nameStatus" className='form-control' defaultValue={this.state.environment.name} id="name" placeholder="name" ref="name" required="true"/>
            <span aria-hidden="true" className={nameFeedbackIconClasses}></span>
            <span className="sr-only" id="nameStatus">{(this.state.errors.name) ? this.state.errors.name.message : ''}</span>
          </div>
        </div>
        <div className={fleetUrlGroupClasses}>
          <div className={fleetUrlAlertClasses} role="alert">
            <span aria-hidden="true" className="glyphicon glyphicon-exclamation-sign"></span>
            <span className="sr-only">Error:</span>
            {(this.state.errors.fleetUrl) ? this.state.errors.fleetUrl.message : '' }
          </div>
          <label className="control-label col-sm-2" htmlFor="fleetUrl">Fleet URL:</label>
          <div className="col-sm-10">
            <input aria-describedby="fleetUrlStatus" className='form-control' defaultValue={this.state.environment.fleetUrl} id="fleetUrl" placeholder="someurl:3001" ref="fleetUrl" required="true"/>
            <span aria-hidden="true" className={fleetUrlFeedbackIconClasses}></span>
            <span className="sr-only" id="fleetUrlStatus">{(this.state.errors.fleetUrl) ? this.state.errors.fleetUrl.message : ''}</span>
          </div>
        </div>
        <div className="form-group">
          <div className="col-sm-offset-2 col-sm-10 btn-group">
            <button className="btn btn-default" onClick={this.handleCancel}>Cancel</button>
            <button className="btn btn-success" type="submit">Save</button>
          </div>
        </div>
      </form>
    );
  }
}
EnvironmentForm.displayName = 'Environment Form';
EnvironmentForm.propTypes = {
  initialEnvironment: React.PropTypes.object.isRequired
};

export default EnvironmentForm;
