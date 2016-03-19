import React, {Component, PropTypes} from 'react';
import {
  IDE,
  Menus,
  Console,
  Sidebar,
  Connectors,
  Layout,
  Loader,
  TextElements,
  FormElements
} from '@hoist/ui';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {connect} from 'react-redux';
import brace from 'brace';
import AceEditor from 'react-ace';
import Helmet from 'react-helmet';
import {EditorActions, SessionActions} from '../actions';
require('./styles/main.scss');
require('brace/mode/javascript');
require('brace/theme/solarized_dark');
import _ from 'lodash';

export class Schedule extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div className="info-block">
      <label>{this.props.pattern}</label>
      {this
        .props
        .events
        .map((event) => {
          return (
            <p className="fixed-width">{event}</p>
          );
        })
}
    </div>
  }
  static propTypes = {
    pattern: PropTypes.string.isRequired,
    events: PropTypes.array.isRequired
  };
}

export class EditorPage extends Component {
  constructor(props) {
    super(props);
    var defaultFilters = ["DEPLOY", "MDL", "ERR", "EVT", "LOG"];
    this.state = {
      selectedTrigger: '',
      code: this.props.code,
      //default console filter = 'all', to be saved against user prefs
      consoleFilter: defaultFilters,
      pageDimensions: {
        consoleHeight: 0
      },
      animation: 'center-modal'
    };
    this.triggerChange = this
      .triggerChange
      .bind(this);
    this.handleCodeChange = this
      .handleCodeChange
      .bind(this);
    this.welcome = this
      .welcome
      .bind(this);
    this.switchApplication = this
      .switchApplication
      .bind(this);
    this.switchOrganisation = this
      .switchOrganisation
      .bind(this);
    this.createOrganisation = this
      .createOrganisation
      .bind(this);
    this.createApplication = this
      .createApplication
      .bind(this);
    this.createEvent = this
      .createEvent
      .bind(this);
    this.myAccount = this
      .myAccount
      .bind(this);
    this.showAddConnectorPanel = this
      .showAddConnectorPanel
      .bind(this);
    this.editConnector = this
      .editConnector
      .bind(this);
    this.filterConsole = this
      .filterConsole
      .bind(this);
    this.updateSize = this
      .updateSize
      .bind(this);
    this.logout = this
      .logout
      .bind(this);
  }
  componentWillMount() {
    this
      .props
      .initEditor();
  }
  welcome() {
    this
      .props
      .history
      .pushState({}, `/${this.props.organisation.slug}/${this.props.application.slug}/welcome`);
  }
  switchApplication(application) {
    this
      .props
      .history
      .pushState({}, `/${this.props.organisation.slug}/${application.slug}`);
  }
  switchOrganisation(organisation) {
    this
      .props
      .history
      .pushState({}, `/${organisation.slug}`);
  }
  createApplication() {
    this
      .props
      .history
      .pushState({}, `/${this.props.organisation.slug}/application/create`)
  }
  createOrganisation() {
    this
      .props
      .history
      .pushState({}, `/organisation/create`)
  }
  myAccount() {
    this
      .props
      .history
      .pushState({}, `/account/info`);
  }
  triggerChange(value) {
    if (this.state.editorDirty) {
      if (!confirm('All your changes will be lost, are you sure?')) {
        return;
      }
    }
    this
      .props
      .switchEvent(value);
  }
  componentDidUpdate(prevProps) {
    if (!this.props.application || !prevProps.application) {
      return;
    }
    if (prevProps.application._id !== this.props.application._id) {
      this
        .props
        .initEditor();
    }
    clearTimeout(this.timeout);
    if (!this.props.console.inProgress) {
      this.startPoll();
    }
    if (this.props.selectedEvent !== prevProps.selectedEvent) {
      this.setState({editorDirty: false, code: this.props.code});
    }
  }
  startPoll() {
    this.timeout = setTimeout(() => this.props.getConsoleMessages(), 5000);
  }
  showAddConnectorPanel() {
    this
      .props
      .history
      .pushState({}, `/${this.props.organisation.slug}/${this.props.application.slug}/connector/create`);
  }
  editConnector(connector) {
    this
      .props
      .history
      .pushState({}, `/${this.props.organisation.slug}/${this.props.application.slug}/connector/edit/${connector.key}`);
  }
  logout() {
    this
      .props
      .history
      .pushState({}, '/logout');
  }
  createEvent() {
    var eventName = prompt("Add an event name, it should be lowercase and include letters, numbers and colons.");
    if (eventName) {
      this
        .props
        .addEvent(eventName);
    }
  }
  onSaveCode() {
    var code = this.state.code;
    this
      .props
      .saveCode(this.props.selectedEvent, this.state.code, () => {
        this.setState(Object.assign({}, this.state, {editorDirty: false}));
      });
  }
  filterConsole(evt) {
    let mapping = {
      deploy: 'DEPLOY',
      event: 'EVT',
      module: 'MDL',
      error: 'ERR',
      log: 'LOG'
    }
    this.setState({consoleFilter: evt});
  }
  componentDidMount() {
    //sizes
    this.updateSize();
  }
  updateSize(size) {
    if (size) {
      this.setState({
        pageDimensions: {
          consoleHeight: size - 75
        }
      });
    } else if (this.refs.horizontalSplit1 && this.refs.horizontalSplit1.refs.pane2 && this.refs.horizontalSplit1.refs.pane2.state.size) {
      this.setState({
        pageDimensions: {
          consoleHeight: this.refs.horizontalSplit1.refs.pane2.state.size - 75
        }
      });
    } else {}
  }
  componentWillReceiveProps(nextProps) {
    var dn = null;

    if (nextProps.children && nextProps.children.type && nextProps.children.type.displayName) {
      dn = nextProps.children.type.displayName;
    } else if (this.props.children && this.props.children.type && this.props.children.type.displayName) {
      dn = this.props.children.type.displayName;
    }
    if (dn && dn.indexOf('CreateConnectorModal') !== -1) {
      this.setState({animation: 'right-modal'});
    } else if (dn && dn.indexOf('WelcomeModal') !== -1) {
      this.setState({animation: 'center-modal'});
    }
  }
  handleCodeChange(code) {
    if (code != this.state.code) {
      this.setState({editorDirty: true, code: code});
    }
  }
  render() {
    if (!this.props.organisation || !this.props.application) {
      return null;
    }
    let schedules = [];
    let endpoints = {};
    if (this.props.application.settings && this.props.application.settings.live) {
      if (this.props.application.settings.live.schedules) {
        schedules = Object
          .keys(this.props.application.settings.live.schedules)
          .map((key) => ({key, events: this.props.application.settings.live.schedules[key].events}));
      }
      if (this.props.application.settings.live.endpoints) {
        Object
          .keys(this.props.application.settings.live.endpoints)
          .forEach((key) => {
            let endpoint = this.props.application.settings.live.endpoints[key];
            endpoint
              .methods
              .forEach((method) => {
                endpoints[method] = endpoints[method] || [];
                endpoints[method].push(key);
              });
          });
      }
    }
    return (
      <IDE>
        <Helmet title='Hoist: Editor'/>
        <Menus.Navigation user={this.props.user} application={this.props.application} applications={this.props.applications} organisation={this.props.organisation} organisations={this.props.organisations} onLogout={this.logout} onOrganisationSelect={this.switchOrganisation} onApplicationSelect={this.switchApplication} onSwitchTheme={this.switchTheme} myAccount={this.myAccount} onWelcome={this.welcome} onAddApplication={this.createApplication} onAddOrganisation={this.createOrganisation}/>
        <Layout.Panels split='vertical'>
          <Layout.Panels.Panel>
            <Layout.Panels split='horizontal' minSize='50' defaultSize='100' onSize={this.updateSize} ref='horizontalSplit1'>
              <Layout.Panels.Panel className='code-pane'>
                <Menus.TriggerBar triggers={this.props.events} connectors={this.props.connectors} onTriggerChange={this.triggerChange} selectedTrigger={this.props.selectedEvent} onNewEvent={this.createEvent} onSave={() => {
                  this.onSaveCode()
                }}/>
                <div style={{
                  marginTop: 17
                }}>
                  <AceEditor onChange={this.handleCodeChange} mode='javascript' width='auto' theme='solarized_dark' showGutter={true} showPrintMargin={false} name='CODE_EDITOR' value={this.state.code} editorProps={{
                    $blockScrolling: true
                  }}/>
                </div>
              </Layout.Panels.Panel>
              <Layout.Panels.Panel minSize='100' defaultSize='200' className='console-pane'>
                <Menus.ConsoleBar onFilterChange={this.filterConsole}/>
                <Console.Feed height={this.state.pageDimensions.consoleHeight} initialEntries={this.props.console.messages} filter={this.state.consoleFilter}/>
              </Layout.Panels.Panel>
            </Layout.Panels>
          </Layout.Panels.Panel>
          <Layout.Panels.Panel className='sidebar-slider' minSize='250' defaultSize='250' scrollable={true}>
            <div style={{borderBottom:'2px solid #2C343F'}}>
              <Sidebar>
                <Sidebar.Panel title='Connectors' key='connectors' reactKey='connectors'>
                  <div style={{
                    marginBottom: 10
                  }}>
                    <TextElements.Label text="YOUR CONNECTORS"/>
                  </div>
                  <Sidebar.InlinePanels activeTab='active-connectors'>
                    <Sidebar.InlinePanel title='Active' key='active-connectors' reactKey='active-connectors'>
                      <Connectors.ConnectorInfoList onSelect={this.editConnector} connectors={this.props.connectors}/>
                        <div style={{
                          marginTop: 30,
                          marginBottom: 10
                        }}>
                          <FormElements.Button text="Add New Connector" onClick={this.showAddConnectorPanel}/>
                        </div>
                    </Sidebar.InlinePanel>
                  </Sidebar.InlinePanels>
                </Sidebar.Panel>
              </Sidebar>
            </div>
            <div style={{borderBottom:'2px solid #2C343F'}}>
              <Sidebar>
                <Sidebar.Panel title='App Settings' key='app-settings' reactKey='app-settings'>
                  <div style={{
                    marginBottom: 10
                  }}>
                    <TextElements.Label text="App Settings"/>
                  </div>
                  <Sidebar.InlinePanels activeTab='deploy'>
                    <Sidebar.InlinePanel title='Deploy' key='deploy' reactKey='deploy'>
                      <div>
                        <div className="info-block">
                          <label>Git Remote</label>
                          <TextElements.Shrinkable text={"https://" + this.props.settings.domains.git + "/" + this.props.organisation.slug + "/" + this.props.application.slug + ".git"} />
                        </div>
                        <div className="info-block">
                          <label>API Key</label>
                          <TextElements.Shrinkable text={this.props.application.apiKey} />
                        </div>
                        <div className="info-block">
                          <label>Application Id</label>
                          <TextElements.Shrinkable text={this.props.application.id} />
                        </div>
                      </div>
                    </Sidebar.InlinePanel>
                    <Sidebar.InlinePanel title='Endpoints' key='endpoints' reactKey='endpoints'>
                      <div>
                        {Object
                          .keys(endpoints)
                          .map((method) => {
                            return (
                              <div key={method} className="info-block">
                                <label>{method.toUpperCase()}</label>
                                {endpoints[method].map((url) => {
                                  return (
                                    <p key={url} className="fixed-width">{url}</p>
                                  );
                                })}
                              </div>
                            );
                          })}
                      </div>
                    </Sidebar.InlinePanel>
                    <Sidebar.InlinePanel title='Cron' key='schedules' reactKey='schedules'>
                      <div>
                        {schedules.map((schedule) => (<Schedule key={schedule.key} pattern={schedule.key} events={schedule.events}/>))}
                      </div>
                    </Sidebar.InlinePanel>
                  </Sidebar.InlinePanels>
                </Sidebar.Panel>
              </Sidebar>
            </div>
          </Layout.Panels.Panel>
        </Layout.Panels>
        <ReactCSSTransitionGroup transitionName={this.state.animation} transitionEnterTimeout={500} transitionLeaveTimeout={500}>
          {this.props.children}
        </ReactCSSTransitionGroup>
      </IDE>
    );

  }
};

EditorPage.propTypes = {
  user: PropTypes.object,
  application: PropTypes.object,
  applications: PropTypes.array.isRequired,
  initEditor: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  switchEvent: PropTypes.func.isRequired,
  code: PropTypes.string,
  selectedEvent: PropTypes.string,
  console: PropTypes.object.isRequired,
  getConsoleMessages: PropTypes.func.isRequired,
  organisation: PropTypes.object,
  events: PropTypes.arrayOf(PropTypes.shape({description: PropTypes.string, name: PropTypes.string, key: PropTypes.key})),
  addEvent: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  saveCode: PropTypes.func.isRequired

};
EditorPage.defaultProps = {
  selectedEvent: ''
};
export default connect(({
  user,
  organisation,
  application,
  events,
  connectors,
  applications,
  organisations,
  editor,
  console,
  settings
}) => ({
  user,
  application,
  organisation,
  events,
  connectors,
  applications,
  organisations,
  code: editor.current,
  selectedEvent: editor.currentEvent,
  console,
  settings
}), Object.assign({}, EditorActions, SessionActions))(EditorPage);
