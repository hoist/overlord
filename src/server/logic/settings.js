import config from 'config';
import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';
import {getAvailableConnectors} from './connector';

Promise.promisifyAll(fs);

export function getAllSettings() {
  return Promise
    .resolve()
    .then(() => {
      return Promise.all([getAvailableConnectors()]);
    })
    .then(([availableConnectors]) => {
      return {availableConnectors}
    });
}
