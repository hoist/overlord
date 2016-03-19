import React, {Component, PropTypes} from 'react';
import {
  FormElements
} from '@hoist/ui';

export class OrganisationForm extends Component {
  constructor (props) {
    super(props);
    this.onSubmit = this
      .onSubmit
      .bind(this);
    this.handleInputChange = this
      .handleInputChange
      .bind(this);
  }

  onSubmit (evt) {
    evt.preventDefault();
    return this
      .props
      .onSubmit(this.state);
  }
  handleInputChange (evt) {
    this.setState({
      [evt.target.name]: evt.target.value
    });
  }
  render () {
    return (
      <form className="explore pure-form pure-form-aligned" onSubmit={this.onSubmit} onChange={this.handleInputChange}>
        <FormElements.Input name="name" label="Organisation Name" type="text" placeholer="Organisation Name" />
        <FormElements.Button onClick={this.onSubmit} type="large" submit={true} text="Create" />
      </form>
    );
  }
}

// <div className="pure-control-group">
        //   <label htmlFor="name">Organisation Name:</label>
        //   <input type="text" name="name"/>
        // </div>
OrganisationForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  status: PropTypes.object
}
