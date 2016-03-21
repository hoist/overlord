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


var randomScalingFactor = function() {
  var max = 5;
  var min = 3;
  return Math.floor(Math.random()*(max-min+1)+min);
};
var randomScalingFactor2 = function() {
  var max = 8;
  var min = 7;
  return Math.floor(Math.random()*(max-min+1)+min);
};

var lineChartData = {
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
      fillColor: "RGBA(238, 69, 126, 0)",
      strokeColor: "RGBA(238, 69, 126, 1)",
      pointColor: "RGBA(238, 69, 126, 1)",
      pointStrokeColor: "#292D34",
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
      fillColor: "RGBA(255, 173, 93, 0)",
      strokeColor: "RGBA(255, 173, 93, 1)",
      pointColor: "RGBA(255, 173, 93, 1)",
      pointStrokeColor: "#292D34",
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


export class SmallKPI extends Component {
  render() {
    return (
      <div className="kpi small cf">
        {this.props.icon ? <div className="left"><span className={this.props.icon}></span></div> : ''}
        <div className="left">
          <span className="kpi-figure">{this.props.number}</span>
          <span className="kpi-title">{this.props.title}</span>
        </div>
        <div className="right">
          <span className="kpi-subtitle">{this.props.subtitle}</span>
        </div>
      </div>
    )
  }
}
export class SmallInlineKPI extends Component {
  render() {
    return (
      <div className="kpi small-inline small cf">
          <div className="left">
            <span className="status" style={{
                backgroundColor: this.props.background
              }}></span>
          </div>
          <div className="left">
            <span className="kpi-figure">{this.props.number}</span>
            <span className="kpi-subtitle">{this.props.title}</span>
          </div>
      </div>
    )
  }
}
export class Server extends Component {
  render() {
    return (
      <div className="queue cf">
        <div className="left">
          <span className="status"></span>
          <span className="title">{this.props.name}</span>
        </div>
      </div>
    )
  }
}
export class Fleet extends Component {
  render() {
    return (
      <div className="queue cf">
        <div className="left">
          <span className="title">{this.props.name}</span>
          <div className="meta" style={{
              paddingLeft:0
            }}>
            {this.props.version}
          </div>
        </div>
        <div className="right">
          <FormElements.Button icon="icon-sync" type="dark icon" />
        </div>
      </div>
    )
  }
}
export class User extends Component {
  render() {
    return (
      <div className="queue cf">
        <div className="left">
          <span className="title">{this.props.name}</span>
          <div className="meta" style={{
              paddingLeft:0
            }}>
            {this.props.email}
          </div>
        </div>
        <div className="right">
          <FormElements.Button icon="icon-minigrin" type="dark icon" />
        </div>
      </div>
    )
  }
}
export class Service extends Component {
  render() {
    return (
      <div className="queue cf">
        <div className="left">
          <span className={"status " + this.props.status}></span>
          <span className="title">{this.props.name}</span>
          <div className="meta">
            2 passing
          </div>
        </div>
        <div className="right">
          <FormElements.Button icon="icon-refreshalt" type="dark icon" />
        </div>
      </div>
    )
  }
}
export class Queue extends Component {
  render() {
    return (
      <div className="queue cf" onClick={this.props.onClick}>
        <div className="left">
          <span className={"status " + this.props.status}></span>
          <span className="title fixed">{this.props.name}</span>
        </div>

      </div>
    )
  }
}
export class QueueDisplay extends Component {
  render() {
    if(this.props.queue) {
    return(
      <div className="filtered-queue">
        <div className="queue-name">{this.props.queue}
          <span className="collapse" onClick={this.props.onClose}>&times;</span>
        </div>
        <div className="padded">
          <Charts.Line height={100} data={lineChartData} />
          <SmallInlineKPI number="446,854" title="Ready" subtitle="" icon="" background="RGBA(240, 65, 125, 1)" />
          <SmallInlineKPI number="447,020" title="In Progress" subtitle="" icon="" background="RGBA(255, 174, 84, 1)" />
          <SmallInlineKPI number="10/s" title="Throughput" subtitle="" icon="" background="rgba(0, 0, 0, 0.2)" />
        </div>
      </div>
    )
  } else {
    return(
      <div >
        <div className="padded">
          <Charts.Line height={100} data={lineChartData} />
          <SmallInlineKPI number="446,854" title="Ready" subtitle="" icon=""  background="RGBA(240, 65, 125, 1)"  />
          <SmallInlineKPI number="447,020" title="In Progress" subtitle="" icon=""  background="RGBA(255, 174, 84, 1)" />
          <SmallInlineKPI number="10/s" title="Throughput" subtitle="" icon="" background="rgba(0, 0, 0, 0.2)"  />
        </div>
      </div>
    )
  }
  }
}
