import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Layout, FormElements, Sidebar, TextElements, Connectors} from '@hoist/ui';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import welcomecss from '../styles/welcome.scss';

export class WelcomeModal extends Component {
  constructor (props) {
  	super(props);
  	this.state = {
  		slide: 0
  	};
  	this.close = this.close.bind(this);
  	this.getStep = this.getStep.bind(this);
  	this.setTo = this.setTo.bind(this);
  	this.handleKeyPress = this.handleKeyPress.bind(this);
  	this.back = this.back.bind(this);
  	this.forward = this.forward.bind(this);
  }
  close () {
    this
      .props
      .history
      .pushState({}, `/${this.props.organisation.slug}/${this.props.application.slug}`);
  }
  
	handleKeyPress(event){
		if(event.keyCode == 27){
			this.close();
		}
		if(event.keyCode == 37){
			//go left
			this.back();
		}
		if(event.keyCode == 39){
			//go right
			this.forward();
		}
	}

	back() {
		var slide = this.state.slide;
		if(slide===0) { slide = 4; } else { slide = slide - 1;}
		this.setState({slide: slide});
	}
	forward() {
		var slide = this.state.slide;
		if(slide===4) { slide = 0; } else { slide = slide + 1;}
		this.setState({slide: slide});
	}

	componentWillMount (){
		document.addEventListener("keyup", this.handleKeyPress, false);
	}


	componentWillUnmount () {
		document.removeEventListener("keyup", this.handleKeyPress, false);
	}

  getStep () {

  	var onboardContent = {
  		titles: [
  			"Welcome to Hoist",
  			"First, set up a Connector.",
  			"Next, choose a Trigger.",
  			"Lastly, Save & Deploy your Task."
  		],
  		content: [
  			"We’re stoked to have you onboard. Take a few minutes to get aquainted with the platform and learn the lingo so you can hit the ground running.",
  			"Connectors are the link between your app and the service you want to connect to. You’ll find them listed in the right hand column.",
  			"Triggers are what Hoist listens for to fire your integration. They are made up of three parts; the connector, the data type and the data state.",
  			"Your task is a Node.js file that will run when Hoist sees the trigger that you have set. We even have a library of sample tasks to choose from."
		],
		background: [
			"slide1",
			"slide2",
			"slide3",
			"slide4"
		]
  	};
  	if(this.state.slide < 4) {
	  	return <WelcomeModalStep 
	  		key={"step" + this.state.slide} 
	  		background={onboardContent.background[this.state.slide]}
	  		title={onboardContent.titles[this.state.slide]}
	  		text={onboardContent.content[this.state.slide]} />
	} else {
		return <WelcomeModalLastStep />
	}

  }
  setTo (slide) {
  	this.setState({slide: slide});
  }
  render () {
    return (
      <div>
      	<span className="closeModal" onClick={this.close}></span>
	      <Layout.Modal height='562' width={608} type="center">
			<div style={{background:'#303B47',height:562}}>
				<div style={{height: 510,position:'relative'}}>
					<ReactCSSTransitionGroup transitionName="welcome-slider" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
						{this.getStep()}
					</ReactCSSTransitionGroup>
					<div className={this.state.slide===0?"moveModalLeft":"moveModalLeft active"} onClick={this.back}></div>
					<div className={this.state.slide===4?"moveModalRight":"moveModalRight active"} onClick={this.forward}></div>
				</div>
	        	<div>
	        		<FormElements.Dots count={5} onClick={this.setTo} active={this.state.slide} />
	        	</div>
	        </div>
	      </Layout.Modal>
      </div>
    );
  }
}
export class WelcomeModalStep extends Component {
	render() {
		var backgroundImage = "url('/img/onboarding/" + this.props.background + "@2x.png') no-repeat"; 
		return (
			<div className="step" style={{position:'absolute', top:0, left:0}}>
				<div style={{height:366,background:backgroundImage,backgroundSize:'608px 366px'}}>
					
				</div>
				<div style={{background:'#303B47',color:'white',textAlign:'center',height:144,padding:'30px 54px 12px'}}>
					<h1 style={{fontSize:16,color:'white',fontWeight:'bold'}}>{this.props.title}</h1>
					<p style={{fontSize:14,lineHeight:'24px',color:'#748192',fontFamily:'robotoregular',fontWeight:'regular'}}>{this.props.text}</p>
				</div>
			</div>
		);
	}	
}
export class WelcomeModalLastStep extends Component {
	render() {
		return (
			<div className="step" style={{position:'absolute', top:0, left:0}}>
				<div style={{height:566,backgroundColor:'#303B47',backgroundImage:"url('/img/onboarding/slide5@2x.png')",backgroundSize:'608px 566px',width:608}}>
					<div style={{padding:'80px 50px 10px',textAlign:'center'}}>
						<h1 style={{fontSize:16,marginTop:0,color:'white',fontWeight:'bold'}}>Tada! That’s all there is to it!</h1>
						<p style={{fontSize:14,lineHeight:'24px',color:'#748192',fontFamily:'robotoregular',fontWeight:'regular'}}>That’s all there is to integrating with Hoist - now it’s your turn! Choose one of the sample integrations below to get up and running in a quick guided demo, or, create your own integration from scratch.</p>
					</div>
					<div className="giantButtonWrapper">
						<div className="giantButton" >Button 1</div>
						<div className="giantButton" >Button 2</div>
						<div className="giantButton" >Button 3</div>
						<div className="giantButton" >Button 4</div>
					</div>
				</div>
			</div>
		);
	}	
}

WelcomeModal.propTypes = {
  organisation: PropTypes.object,
  application: PropTypes.object
}

export default connect(({organisation, application}) => ({organisation, application}), Object.assign({}))(WelcomeModal);
