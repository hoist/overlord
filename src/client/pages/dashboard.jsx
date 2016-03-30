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
  FormElements,
  Charts
} from '@hoist/ui';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import {
  Queue,
  SmallKPI,
  SmallInlineKPI,
  Server,
  Fleet,
  User,
  Service,
  QueueDisplay
} from '../components/pieces.jsx';
import {FleetActions, ConsulActions, RabbitActions} from '../actions';
import _ from 'lodash';
import css from './styles/main.scss';

var randomScalingFactor = function() {
  var max = 5;
  var min = 3;
  return Math.floor(Math.random() * (max - min + 1) + min);
};
var randomScalingFactor2 = function() {
  var max = 8;
  var min = 7;
  return Math.floor(Math.random() * (max - min + 1) + min);
};

var lineChartData2 = {
  labels: [
    "10:00",
    "10:10",
    "10:20",
    "10:30",
    "10:40",
    "10:50",
    "11:00",
    "11:10",
    "11:20",
    "11:30",
    "11:40",
    "11:50",
    "12:00",
    "12:10",
    "12:20",
    "12:30",
    "12:40",
    "12:50",
    "13:00",
    "13:10",
    "13:20",
    "13:30",
    "13:40",
    "13:50"
  ],
  datasets: [
    {
      label: "My First dataset",
      fillColor: "RGBA(105, 70, 156, 0)",
      strokeColor: "RGBA(105, 70, 156, 1)",
      pointColor: "RGBA(105, 70, 156, 1)",
      pointStrokeColor: "RGBA(105, 70, 156, 1)",
      data: [
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor()
      ]
    }, {
      label: "My Second dataset",
      fillColor: "RGBA(0, 157, 139, 0)",
      strokeColor: "RGBA(0, 157, 139, 1)",
      pointColor: "RGBA(0, 157, 139, 1)",
      pointStrokeColor: "RGBA(0, 157, 139, 1)",
      data: [
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2(),
        randomScalingFactor2()
      ]
    }
  ]
}

export class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.getFleet = this.getFleet.bind(this);
    this.filterFleet = this.filterFleet.bind(this);
    this.state = {
      fleetFilter: null
    };
  }
  componentDidMount() {
    //this will update the state graph and thus rerender the component (although it should happen before the component renders)
    this.props.getLatestFleetConfiguration();
    this.props.getLatestConsulStatus();
    this.props.getQueues();
    this.props.getQueueStats();
    setInterval(this.props.getQueueStats, 5000);
  }
  componentDidUpdate(prevProps) {
    // if(this.props.rabbit.stats.stamp !== prevProps.rabbit.stats.stamp) {
    //
    // }
  }
  getFleet() {
    if(this.state.fleetFilter) {
      return _.filter(this.props.fleet, (f) => {
        return f.name.indexOf(this.state.fleetFilter) !== -1
      });
    }
    return this.props.fleet;
  }
  filterFleet(event) {
    this.setState({fleetFilter: event.target.value || null});
  }
  render() {
    return (
      <div className="wrapper">
        <div className="column">
          <div className="page-title">
            Health Check
          </div>
          <div style={{
              display:'none'
            }}>
            <TextElements.Label text="Executors"/>
            <div style={{
              marginTop: 5,
              marginBottom: 30
            }}>
              <KPI number={192} title="Active Executors" subtitle="Last Updated 10:01 am"/>
              <KPI number={41} title="Failing Executors" subtitle="Last Updated 10:01 am"/>
            </div>
            <TextElements.Label text="Errors"/>
            <Charts.Line height={100} data={lineChartData2}/>
            <div style={{
              marginTop: 5,
              marginBottom: 30
            }}>
              <SmallKPI number={200} title="Errors" subtitle="Last Updated 10:01 am" icon="icon-cloudhosting"/>
              <SmallKPI number={200} title="Errors" subtitle="Last Updated 10:01 am" icon="icon-websitealt"/>
              <SmallKPI number={200} title="Errors" subtitle="Last Updated 10:01 am" icon="icon-ram"/>
              <SmallKPI number={200} title="Errors" subtitle="Last Updated 10:01 am" icon="icon-vps"/>
            </div>
          </div>
          <TextElements.Label text="Services"/> {this.props.consul.services.map((s, i) => {
            return <Service name={s.name} key={i} tags={s.tags}/>;
          })}
        </div>
        <div className="column">
          <div className="page-title">
            &nbsp;
          </div>
          <div style={{
            marginBottom: 40
          }}>
            <TextElements.Label text="Queues"/>
            <QueueDisplay queue={this.state.queue} stats={this.props.rabbit.stats} onClose={() => {
              this.setState({queue: ''})
            }}/>
          <input type="text" className="dark filter" placeholder="Filter"/> {this.props.rabbit.queues.map((q, i) => {
              return <Queue name={q.name} key={i} status={q.state} onClick={() => {
                this.setState({queue: q.name});
              }}/>;
            })}
          </div>
        </div>
        <div className="column">
          <div className="page-title">
            Deploy
          </div>
          <TextElements.Label text="Fleet"/>
          <input type="text" className="dark filter" placeholder="Filter" onChange={this.filterFleet}/> {this.getFleet().map((f, i) => {
            return <Fleet name={f.name} key={i} state={f.currentState}/>;
          })}
        </div>
        <div className="column" style={{
          color: 'white'
        }}>
          <div className="page-title">
            &nbsp;
          </div>
          <TextElements.Label text="Servers"/>
          <input type="text" className="dark filter" placeholder="Filter"/> {this.props.consul.nodes.map((s, i) => {
            return <Server name={s.Node} key={i} ip={s.Address}/>;
          })}
          <div style={{
              display:'none'
            }}>
          <TextElements.Label text="Users"/>
          <input type="text" className="dark filter" placeholder="Filter"/> {this.props.users.map((u, i) => {
            return <User name={u.name} key={i} email={u.email}/>;
          })}
        </div>
        </div>
      </div>
    );
  }

};
Dashboard.propTypes = {
  //this matches the name imported on FleetActions
  getLatestFleetConfiguration: PropTypes.func.isRequired,
  services: PropTypes.array,
  users: PropTypes.array,
  queues: PropTypes.array,
  fleet: PropTypes.array
};
//use props over state as they can be fed in from Redux
Dashboard.defaultProps = {
  queues: [
    {
      name: 'BiTecvyP8oVJIVeUtsmG_events',
      status: 'green'
    }, {
      name: '25wExrU0XxRlnnWrl5Jo_events',
      status: 'green'
    }, {
      name: '2AG_0ZQ9Qr7IW6agTcHc_events',
      status: 'green'
    }, {
      name: '3p3V_5yIZR6QS_vdAZSo_events',
      status: 'red'
    }, {
      name: '4pAaOrZzzzu_p74KiSHZ_events',
      status: 'green'
    }, {
      name: '4w3mS10kTV85zhi-idkD_events',
      status: 'green'
    }, {
      name: '5pBsEybgnRqfhjVgMjD1_events',
      status: 'orange'
    }
  ],
  fleet: [],
  users: [
    {
      name: "Jamie Wilson",
      email: 'jamie@hoist.io'
    }, {
      name: "Owen Evans",
      email: 'owen@bgeek.net'
    }, {
      name: "Andrew Cox",
      email: 'andrew@cox.com'
    }, {
      name: "Andrew Butel",
      email: 'andrew@butel.co.nz'
    }, {
      name: "Helen Simonson",
      email: 'simonsonster@gmail.com'
    }, {
      name: "Jamie Wilson",
      email: 'jamie@hoist.io'
    }, {
      name: "Owen Evans",
      email: 'owen@bgeek.net'
    }, {
      name: "Andrew Cox",
      email: 'andrew@cox.com'
    }, {
      name: "Andrew Butel",
      email: 'andrew@butel.co.nz'
    }, {
      name: "Helen Simonson",
      email: 'simonsonster@gmail.com'
    }, {
      name: "Jamie Wilson",
      email: 'jamie@hoist.io'
    }, {
      name: "Owen Evans",
      email: 'owen@bgeek.net'
    }, {
      name: "Andrew Cox",
      email: 'andrew@cox.com'
    }, {
      name: "Andrew Butel",
      email: 'andrew@butel.co.nz'
    }, {
      name: "Helen Simonson",
      email: 'simonsonster@gmail.com'
    }, {
      name: "Jamie Wilson",
      email: 'jamie@hoist.io'
    }, {
      name: "Owen Evans",
      email: 'owen@bgeek.net'
    }, {
      name: "Andrew Cox",
      email: 'andrew@cox.com'
    }, {
      name: "Andrew Butel",
      email: 'andrew@butel.co.nz'
    }, {
      name: "Helen Simonson",
      email: 'simonsonster@gmail.com'
    }
  ],
  servers: [
    {
      name: 'ip-172-16-2-103.hoist.internal',
      ip: '172-16-2-103'
    }, {
      name: 'ip-172-16-2-103.hoist.internal',
      ip: '172-16-2-103'
    }, {
      name: 'ip-172-16-2-103.hoist.internal',
      ip: '172-16-2-103'
    }, {
      name: 'ip-172-16-2-103.hoist.internal',
      ip: '172-16-2-103'
    }, {
      name: 'ip-172-16-2-103.hoist.internal',
      ip: '172-16-2-103'
    }
  ],
  services: [
    {
      name: 'api',
      status: 'green'
    }, {
      name: 'api',
      status: 'green'
    }, {
      name: 'api',
      status: 'green'
    }, {
      name: 'api',
      status: 'green'
    }, {
      name: 'api',
      status: 'green'
    }, {
      name: 'api',
      status: 'green'
    }
  ]
};

export class KPI extends Component {
  render() {
    return (
      <div className="kpi cf">
        {this.props.icon
          ? <div className="left">
              <span className={this.props.icon}></span>
            </div>
          : ''}
        <div className="left">
          <span className="kpi-figure">{this.props.number}</span>
        </div>
        <div className="left">
          <span className="kpi-title">{this.props.title}</span>
          <span className="kpi-subtitle">{this.props.subtitle}</span>
        </div>

      </div>
    )
  }
}

export default connect((state) => {
  return {fleet: state.fleet, consul: state.consul, rabbit: state.rabbit};
},
//create a new object with all the properties of FleetActions, basically all the FleetAction methods
Object.assign({}, FleetActions, ConsulActions, RabbitActions))(Dashboard);
