import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Theme, FormElements, Sidebar} from '@hoist/ui';
import {ConnectorActions} from '../actions';
import connector from '../pages/styles/connector.scss';
import connectorList from '../pages/styles/connector-list.scss';
import _ from 'lodash';

export class EditConnectorForm extends Component {
  constructor(props) {
    super(props);
    this.browse = this.browse.bind(this);

    var connectorInstance = _.find(this.props.connectors, {key: this.props.params.connectorKey}) || {};
    var connectorPrototype = _.find(this.props.availableConnectors, {key: connectorInstance.type}) || {};

    this.state = {connectorInstance: connectorInstance, connectorPrototype: connectorPrototype};

    var $script = require('scriptjs');
    $script(`/api/connector/bundle/${connectorInstance.type}/edit`, () => {
      this.setState({loaded: true});
    });

  }
  connect() {}
  back() {
    this
      .props
      .history
      .goBack();
  }
  browse() {
    this
      .props
      .history
      .pushState({}, `/${this.props.organisation.slug}/${this.props.application.slug}/connector/create`);
  }
  render() {
    let form = [];
    if (typeof EditForm !== 'undefined') {
      if (this.state && this.state.loaded) {
        form = (<EditForm {...this.props} onBrowse={this.browse} onConnect={(params) => {
          this
            .props
            .onConnectorConnect(this.props.params.connectorType, params);
        }} key='editForm' connectorInstance={this.state.connectorInstance} connectorPrototype={this.state.connectorPrototype}/>);
      }
    } else {
      form = (
        <div></div>
      );
    }
    return (
      <Theme theme="light">
        {form}
      </Theme>
    );

  }
}
EditConnectorForm.propTypes = {
  onConnectorConnect: PropTypes.func.isRequired,
  status: PropTypes.object
};

export default connect(({
  application,
  applications,
  connectors,
  availableConnectors,
  console,
  editor,
  events,
  organisation,
  user
}) => ({
  application,
  applications,
  connectors,
  availableConnectors,
  console,
  events,
  organisation,
  user
}), Object.assign({}, ConnectorActions))(EditConnectorForm);
