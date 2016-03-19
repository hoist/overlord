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
import {EditorActions, SessionActions} from '../actions';
import _ from 'lodash';



export class EditorPage extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div style={{padding: 17,marginTop:20}}>
        <div style={{width: '60%', float:'left'}}>
          <div style={{
              color:'white',
              fontSize:'14',
              marginBottom:'20'
            }}>
            Servers
          </div>
          <div style={{
              marginBottom:'20'
            }}>
            <Charts.Line />
          </div>
          <div style={{marginRight:'20px'}}>
            <div style={{margin:'10px 0px',background:'#2E323A',borderRadius:'3',border:'1px solid #2E323A',padding:'5px 10px'}}>
              <span style={{display:'inline-block',width:6,height:6,borderRadius:6,marginRight:5,background:'#009C8B'}}></span>
              <span style={{color:'white'}}>beta.hoi.io@1.service</span>
              <div style={{marginTop:5}}>
                <div style={{color:'#8497B7',fontSize:10,paddingLeft:11}}>Uptime 12:01 hrs</div>
              </div>
            </div>
<div style={{margin:'10px 0px',background:'#2E323A',borderRadius:'3',border:'1px solid #2E323A',padding:'5px 10px'}}>
              <span style={{display:'inline-block',width:6,height:6,borderRadius:6,marginRight:5,background:'#009C8B'}}></span>
              <span style={{color:'white'}}>beta.hoi.io@1.service</span>
              <div style={{marginTop:5}}>
                <div style={{color:'#8497B7',fontSize:10,paddingLeft:11}}>Uptime 12:01 hrs</div>
              </div>
            </div>
<div style={{margin:'10px 0px',background:'#2E323A',borderRadius:'3',border:'1px solid #2E323A',padding:'5px 10px'}}>
              <span style={{display:'inline-block',width:6,height:6,borderRadius:6,marginRight:5,background:'#009C8B'}}></span>
              <span style={{color:'white'}}>beta.hoi.io@1.service</span>
              <div style={{marginTop:5}}>
                <div style={{color:'#8497B7',fontSize:10,paddingLeft:11}}>Uptime 12:01 hrs</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{width: '20%', float:'left',marginTop:'45'}}>
          <TextElements.Label text="Queues" />
        </div>
        <div style={{width: '20%', float:'left',marginTop:'45'}}>
          <TextElements.Label text="Services" />
            <input type="text" className="dark" style={{
                background:'rgba(0,0,0,0.2)',
                margin:'5px 0px',
                padding:'4px',
                color:'#8497B7',
                border:'none',
                borderRadius: 3,
                display:'block',
                width:'100%'
            }} placeholder="Filter" />
            <div style={{margin:'10px 0px',borderTop:'1px solid #2E323A',paddingTop:5}}>
              <span style={{display:'inline-block',width:6,height:6,borderRadius:6,marginRight:5,background:'#009C8B'}}></span>
              <span style={{color:'white'}}>beta.hoi.io@1.service</span>
              <div style={{marginTop:5}}>
                <div style={{color:'#8497B7',fontSize:10,paddingLeft:11}}>Uptime 12:01 hrs</div>
              </div>
            </div><div style={{margin:'10px 0px',borderTop:'1px solid #2E323A',paddingTop:5}}>
                <span style={{display:'inline-block',width:6,height:6,borderRadius:6,marginRight:5,background:'#FF7A00'}}></span>
              <span style={{color:'white'}}>beta.hoi.io@1.service</span>
              <div style={{marginTop:5}}>
                <div style={{color:'#8497B7',fontSize:10,paddingLeft:11}}>Uptime 12:01 hrs</div>
              </div>
            </div><div style={{margin:'10px 0px',borderTop:'1px solid #2E323A',paddingTop:5}}>
              <span style={{display:'inline-block',width:6,height:6,borderRadius:6,marginRight:5,background:'#009C8B'}}></span>
              <span style={{color:'white'}}>beta.hoi.io@1.service</span>
              <div style={{marginTop:5}}>
                <div style={{color:'#8497B7',fontSize:10,paddingLeft:11}}>Uptime 12:01 hrs</div>
              </div>
            </div>
        </div>
      </div>
    );
  }
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
