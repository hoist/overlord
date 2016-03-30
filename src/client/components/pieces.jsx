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

var lineChartDataBase = {
  labels: [
    "","","","","","","","","","",""
  ],
  datasets: [
    {
      label: "No Label",
      fillColor: "RGBA(238, 69, 126, 0)",
      strokeColor: "RGBA(238, 69, 126, 1)",
      pointColor: "RGBA(238, 69, 126, 1)",
      pointStrokeColor: "#292D34",
      data: [
      ]
    }, {
      label: "No Label",
      fillColor: "RGBA(255, 173, 93, 0)",
      strokeColor: "RGBA(255, 173, 93, 1)",
      pointColor: "RGBA(255, 173, 93, 1)",
      pointStrokeColor: "#292D34",
      data: [
      ]
    },
    {
      label: "No Label",
      fillColor: "RGBA(0,0,0,0)",
      strokeColor: "RGBA(0,0,0,0)",
      pointColor: "RGBA(0,0,0,0)",
      pointStrokeColor: "#000000",
      data: [
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
          <div className="meta">{this.props.ip}</div>
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
            {this.props.state}
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
            {this.props.tags.length > 0 ? this.props.tags.join(', ') : 'No Tags'}
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
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


export class QueueDisplay extends Component {
  render() {
    var ready = '-', unack = '-', total = '-', pub = '-', ack = '-', deliver = '-', chartData = null, chartData2 = null;
    if(this.props.stats.message_stats) {
      //rate = this.props.stats.message_stats.ack_details.rate + '/s';
      ready = numberWithCommas(this.props.stats.queue_totals.messages_ready);
      unack = numberWithCommas(this.props.stats.queue_totals.messages_unacknowledged);
      total = numberWithCommas(this.props.stats.queue_totals.messages);
      pub = this.props.stats.message_stats.publish_details.rate + '/s';
      ack = this.props.stats.message_stats.ack_details.rate + '/s';
      deliver = this.props.stats.message_stats.deliver_details.rate + '/s';
      //this.props.stats.queue_totals.messages_details
      chartData = Object.assign({}, lineChartDataBase);
      chartData.datasets[0].data = this.props.stats.queue_totals.messages_ready_details.samples.map((s) => {
        return Math.floor(s.sample / 1);
      }).reverse();
      chartData.datasets[1].data = this.props.stats.queue_totals.messages_unacknowledged_details.samples.map((s) => {
        return Math.floor(s.sample / 1);
      }).reverse();
      chartData.datasets[2].data = this.props.stats.queue_totals.messages_details.samples.map((s) => {
        return Math.floor(s.sample / 1);
      }).reverse();
    }

    if(this.props.queue) {
    return(
      <div className="filtered-queue">
        <div className="queue-name">{this.props.queue}
          <span className="collapse" onClick={this.props.onClose}>&times;</span>
        </div>
        <div className="padded">
          <Charts.Line height={100} data={chartData} />
          <SmallInlineKPI number={ready} title="Ready" subtitle="" icon="" background="RGBA(240, 65, 125, 1)" />
          <SmallInlineKPI number={unack} title="Publish Rate" subtitle="" icon="" background="RGBA(255, 174, 84, 1)" />
          <SmallInlineKPI number={total} title="Throughput" subtitle="" icon="" background="rgba(0, 0, 0, 0.2)" />
        </div>
      </div>
    ) 
  } else {
    return(
      <div>
        <div className="padded">
          <Charts.Line height={100} data={chartData} />
          <SmallInlineKPI number={ready} title="Ready" subtitle="" icon=""  background="RGBA(240, 65, 125, 1)"  />
          <SmallInlineKPI number={unack} title="Unacked" subtitle="" icon=""  background="RGBA(255, 174, 84, 1)" />
          <SmallInlineKPI number={total} title="Total" subtitle="" icon="" background="rgba(0, 0, 0, 0.2)" />
        </div>
        <div className="padded">
          <SmallInlineKPI number={pub} title="Publish" subtitle="" icon="" background="RGBA(240, 65, 125, 1)" />
          <SmallInlineKPI number={ack} title="Acknowledge" subtitle="" icon="" background="RGBA(255, 174, 84, 1)" />
          <SmallInlineKPI number={deliver} title="Deliver" subtitle="" icon="" background="rgba(0, 0, 0, 0.2)" />
        </div>
      </div>
    )
  }
  }
}
