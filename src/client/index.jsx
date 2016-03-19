import React from 'react';
import {render} from 'react-dom';
import {Router} from './components/router';

let router = (<Router/>);

render(router, document.getElementById('root'));

document
  .getElementById('INITIAL_STATE')
  .remove();
