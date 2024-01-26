/* eslint-disable no-inner-declarations,no-extend-native */
'use strict';
import 'whatwg-fetch';
import '@babel/polyfill';
import 'promise-polyfill/src/polyfill';

Object.assign = Object.assign || function ObjectAssign(target, varArgs) {
  // .length of function is 2;
  if(!target) throw new TypeError('Cannot convert undefined or null to object');
  const to = Object(target);

  for (let index = 1; index < arguments.length; index++) {
    const nextSource = arguments[index];

    if(nextSource) {
      // Skip over if undefined or null
      for(const nextKey in nextSource) {
        // Avoid bugs when hasOwnProperty is shadowed
        if(Object.prototype.hasOwnProperty.call(nextSource, nextKey)) to[nextKey] = nextSource[nextKey];
      }
    }
  }
  return to;
};

if (typeof window.CustomEvent !== 'function') {
  // noinspection JSAnnotator
  function CustomEvent(event, params = { bubbles: false, cancelable: false, detail: undefined}) {
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(
      event,
      params.bubbles,
      params.cancelable,
      params.detail
    );
    return evt;
  }
  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
}


window.matchMedia = window.matchMedia || function MatchMedia() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

if(!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function value(predicate) {
      // 1. Let O be ? ToObject(this value).
      if(!this) throw new TypeError('"this" is null or not defined');
      const o = Object(this);
      // 2. Let len be ? ToLength(? Get(O, "length")).
      const len = o.length >>> 0;
      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if(typeof predicate !== 'function') throw new TypeError('predicate must be a function');
      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      const thisArg = arguments[1];
      // 5. Let k be 0.
      let k = 0;
      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        const kValue = o[k];
        if(predicate.call(thisArg, kValue, k, o)) return kValue;
        // e. Increase k by 1.
        k++;
      }
      // 7. Return undefined.
      return undefined;
    },
    configurable: true,
    writable: true
  });
}

if(!Promise.prototype.onFinally) {
  Promise.prototype.onFinally = function(cb) {
    const res = () => this
    return this.then(value =>
            Promise.resolve(cb({state:"fulfilled", value})).then(res)
        , reason =>
            Promise.resolve(cb({state:"rejected", reason})).then(res)
    );
  };
}

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

Array.prototype.move = function(from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
};
