'use strict';

import 'process';
import get from 'lodash/get';

export const APP_DOM_ID = 'app';
export const APP_DOM_CLASS = 'app';

export const APP_DEFAULT_LANGUAGE = 'en';

export const IS_DEVELOP = process.env.NODE_ENV === "development";
const loc = document.location;
export const API_URL =
  IS_DEVELOP
    ? 'http://localhost:3000'
    : `${loc.protocol}//api.${location.host}`;
export const STORAGE_URL = process.env.STORAGE_URL;
export const BUILT_AT = process.env.BUILT_AT;

export const TIMEZONE_OFFSET = 0; //(new Date()).getTimezoneOffset() * 60;

export const IS_TELEGRAM = IS_DEVELOP
  || !!get(window, 'Telegram.WebApp.initData', '').length;