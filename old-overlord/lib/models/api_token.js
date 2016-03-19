'use strict';

import timestamps from 'mongoose-timestamp';
import BBPromise from 'bluebird';
import randomToken from 'random-token';
import connectionManager from './connection_manager';
import {
  Schema
}
from 'mongoose';

var APITokenSchema = new Schema({
  token: {
    type: String,
    unique: true,
    index: true,
    default: function () {
      return randomToken(26);
    }
  },
  name: {
    type: String,
    required: true,
    unique: true
  }
}, {
  read: 'nearest'
});

APITokenSchema.plugin(timestamps);
connectionManager.connection.model('APIToken', APITokenSchema);
var APIToken = connectionManager.connection.model('APIToken');
BBPromise.promisifyAll(APIToken);
BBPromise.promisifyAll(APIToken.prototype);

export default APIToken;
