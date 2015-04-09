'use strict';

var _ = require('lodash');

function BaseController() {
  this.routes = [];
  _.bindAll(this);
}


module.exports = BaseController;
