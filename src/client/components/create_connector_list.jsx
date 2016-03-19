import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {FormElements, Sidebar, TextElements, Connectors} from '@hoist/ui';
import logincss from '../pages/styles/connector-list.scss';

export class CreateConnectorList extends Component {
  goToCreateForm(connector) {
    this
      .props
      .history
      .pushState({}, `/${this.props.organisation.slug}/${this.props.application.slug}/connector/create/${connector.key}`);
  }
  close() {
    this
      .props
      .history
      .pushState({}, `/${this.props.organisation.slug}/${this.props.application.slug}`);
  }
  render() {
    return (
      <div>
        <div className="main-content" style={{width:'auto',marginRight:0}}>
          {this
            .props
            .connectors
            .map((c) => {
              return <ApiBlock key={c.key} connector={c} onSelect={(connector) => {
                this.goToCreateForm(connector);
              }}/>;
            })}
        </div>
        <div className="side-content" style={{display:'none'}}>
          <a className="close-times" onClick={() => {
            this.close();
          }}>&times;</a>
          <TextElements.Label text="Filter by Category"/>
          <ul className="filter-list">
            <li className="active">
              <a href="javascript:">All</a>
            </li>
            <li>
              <a href="javascript:">Billing, Accounting &amp; Invoicing</a>
            </li>
            <li>
              <a href="javascript:">Bookmarking</a>
            </li>
            <li>
              <a href="javascript:">CMS</a>
            </li>
            <li>
              <a href="javascript:">CRM</a>
            </li>
          </ul>
          <div>
            <TextElements.Label text="Featured Connector"/>
            <div className="advertisement"></div>
          </div>
        </div>
      </div>
    );
  }
}
CreateConnectorList.propTypes = {
  connectors: PropTypes
    .arrayOf(PropTypes.shape({name: PropTypes.string, key: PropTypes.string, icon: PropTypes.string}))
    .isRequired,
  organisation: PropTypes.object,
  application: PropTypes.object
}

export class ApiBlock extends Component {
  render() {
    return (
      <div className={"api " + this.props.connector.key} onClick={() => {
        return this
          .props
          .onSelect(this.props.connector);
      }}>
        <div className="icon"></div>
        <div className="media">
          <span className="title">{this.props.connector.settings.name}</span>
          <span className="description">{this.props.connector.key}</span>
          <a>Check it out</a>
        </div>
      </div>
    )
  }
}

export default connect(({availableConnectors, organisation, application}) => ({connectors: availableConnectors, organisation, application}), Object.assign({}))(CreateConnectorList);
