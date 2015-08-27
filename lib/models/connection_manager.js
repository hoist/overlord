'use strict';
import mongoose from 'mongoose';
import Bluebird from 'bluebird';

class MongooseConnectionManager {
  constructor() {
    this.connection = mongoose.createConnection();
    Bluebird.promisifyAll(this.connection);
  }
  connect(connectionString) {
    if (!this.connection) {
      return Promise.resolve();
    }
    return this.connection.openAsync(connectionString);
  }
  disconnect() {
    if (!this.connection) {
      return Promise.resolve();
    }
    return this.connection.disconnectAsync();
  }
}

export default new MongooseConnectionManager();
