import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Layout, FormElements, Sidebar, TextElements, Connectors} from '@hoist/ui';

export class CreateConnectorModal extends Component {
  constructor(props) {
    super(props);
    this.goToForm = this.goToForm.bind(this);
    var edit = this.props.routes[this.props.routes.length-2].path === "edit";
    this.state = {
      edit: edit,
      active: this.props.params.connectorKey,
      connectors: edit ? this.props.connectors : this.props.availableConnectors,
      connectorLabel: edit ? 'Your Connectors' : 'Available Connectors'
    };
  }
  close () {
    this
      .props
      .history
      .pushState({}, `/${this.props.organisation.slug}/${this.props.application.slug}`);
  }
  goToForm(connector) {
    this.setState({active: connector.key});
    if(this.state.edit) {
      this
        .props
        .history
        .pushState({}, `/${this.props.organisation.slug}/${this.props.application.slug}/connector/edit/${connector.key}`);
    } else {
      this
        .props
        .history
        .pushState({}, `/${this.props.organisation.slug}/${this.props.application.slug}/connector/create/${connector.key}`);
    }
  }
  render () {
    return (
      <Layout.Slide width={1200}>
        <Layout.Slide.Sidebar>
          <Sidebar className="modal-sidebar sidebar">
          <Sidebar.Panel key='connectors' reactKey='connectors'>
            <div style={{marginBottom:20, marginTop: 40}}>
              <TextElements.Link text="Close" onClick={() => {
                this.close();
              }}/>
            </div>
            <Sidebar.InlinePanels activeTab='trigger-connectors'>
              <Sidebar.InlinePanel title={this.state.connectorLabel} key='trigger-connectors' reactKey='trigger-connectors'>
                <Connectors.ConnectorInfoList connectors={this.state.connectors} onSelect={(connector) => {
                  this.goToForm(connector);
                }} active={this.state.active} />
              </Sidebar.InlinePanel>
            </Sidebar.InlinePanels>
            </Sidebar.Panel>
            <Sidebar.Panel><div></div></Sidebar.Panel>
          </Sidebar>
        </Layout.Slide.Sidebar>
        <Layout.Slide.Content>
          {this.props.children}
        </Layout.Slide.Content>
      </Layout.Slide>
    );
  }
}

// <div style={{marginBottom: 10}}>
//   <TextElements.Label text="AVAILABLE CONNECTORS" />
// </div>
// ** DUMMY DATA ** //
// [{key: "hoist-connector-angel-list", settings: {name: "Angel List"}},
// {key: "hoist-connector-chargify", settings: {name: "Chargify"}},
// {key: "hoist-connector-github", settings: {name: "Github"}},
// {key: "hoist-connector-gitlab", settings: {name: "Gitlab"}},
// {key: "hoist-connector-highrise", settings: {name: "Highrise"}},
// {key: "hoist-connector-hipchat", settings: {name: "Hipchat"}},
// {key: "hoist-connector-intercom", settings: {name: "Intercom"}},
// {key: "hoist-connector-myob-accountright", settings: {name: "MYOB AccountRight"}},
// {key: "hoist-connector-quickbooks-online", settings: {name: "Quickbooks Online"}},
// {key: "hoist-connector-salesforce", settings: {name: "Salesforce"}},
// {key: "hoist-connector-slack", settings: {name: "Slack"}},
// {key: "hoist-connector-trello", settings: {name: "Trello"}},
// {key: "hoist-connector-twitter", settings: {name: "Twitter"}},
// {key: "hoist-connector-vend", settings: {name: "Vend"}},
// {key: "hoist-connector-wordpress", settings: {name: "Wordpress"}},
// {key: "hoist-connector-workflowmax", settings: {name: "WorkflowMax"}},
// {key: "hoist-connector-xero", settings: {name: "Xero"}}]

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, ownProps, {
    animationType: 'fromTop'
  })
}


CreateConnectorModal.propTypes = {
  organisation: PropTypes.object,
  application: PropTypes.object
}

export default connect(({connectors, availableConnectors, organisation, application}) => ({connectors, availableConnectors, organisation, application}), Object.assign({}))(CreateConnectorModal);
