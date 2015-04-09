'use strict';

var _ = require('lodash');

function BaseController() {
  this.routes = [];
  this.name = "BaseController";
  _.bindAll(this);
}


module.exports = BaseController;
