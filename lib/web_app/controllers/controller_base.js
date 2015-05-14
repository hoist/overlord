'use strict';
var _ = require('lodash');
var logger = require('hoist-logger');

function BaseController() {
  this.routes = [];
  this.name = "BaseController";
  _.bindAll(this);
  this.logger = logger.child({cls:this.constructor.name});
  this.logger.alert = logger.alert;
}


module.exports = BaseController;
