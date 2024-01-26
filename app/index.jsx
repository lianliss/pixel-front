'use strict';
/**
 * @module app/app
 */
import React from "react";
import {render} from 'react-dom';
import 'core-js';
import 'array-flat-polyfill';
const getRoot = () => import('./root');
const getAppContainer = () => import('./root/container');
import * as es6Promise from 'es6-promise';

es6Promise.polyfill();

const start = async () => {
  const {default: Root} = await getRoot();
  const {default: AppContainer} = await getAppContainer();

  Root.start(AppContainer);
};

if('Map' in window &&
  'URL' in window &&
  'keys' in Object &&
  'fetch' in window &&
  'assign' in Object &&
  'forEach' in NodeList.prototype &&
  'entries' in Object &&
  'endsWith' in String.prototype &&
  'includes' in String.prototype &&
  'includes' in Array.prototype &&
  'onFinally' in Promise.prototype &&
  'startsWith' in String.prototype) {
  console.info('[app/index]polyfills are not required');
  start();
} else {
  console.info('[app/index]importing polyfills');
  import('utils/polyfills').then(start);
}
