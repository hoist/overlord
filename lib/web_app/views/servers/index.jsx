'use strict';
import React from "react";
import Transmit from "react-transmit";
import Page from '../_components/page.jsx';
import MachineView from './components/machine_view.jsx';
import {} from 'isomorphic-fetch';

class ServerIndex extends React.Component {
  componentWillMount() {
    if (process && process.browser) {
      //this forces a reload of components on the client
      this.props.setQueryParams({
        run: true
      });
    }
  }
  render() {
      const machines = this.props.machines || [];
      return (
       <Page {...this.props}>
          <div className="col col3">
            <div className="panel">
              <div className="head">Servers</div>
              <div className="body">
                {machines.map((machine, index)=>{
                  return <MachineView key={index} machine={machine}/>;
                })}
              </div>
            </div>
          </div>
       </Page>
      );
  }
}

ServerIndex.displayName = 'Server Index';
ServerIndex.propTypes = {
  machines: React.PropTypes.array.isRequired,
  setQueryParams: React.PropTypes.func.isRequired
};

export default Transmit.createContainer(ServerIndex, {
  queries: {
    machines() {
      if (process && process.browser) {
        return global.fetch('/api/servers', {
          credentials: 'include'
        }).then((response) => response.json());
      } else {
        return new Promise((resolve) => {
          resolve([]);
        });
      }
    }
  }
});



