'use strict';

const APP_DOM_LOADED_STATES = ['complete', 'loaded', 'interactive'];

const banner = '%cStore';
const bannerStyle = [
    'background:#1e82dd',
    'color: #fff',
    'width: 100%',
    'padding:15px 20px 20px 20px',
    'margin: -5px 0',
    'text-transform: uppercase',
    'font-size: 18px',
    '-webkit-font-smoothing',
].join(';');
const printBanner = () => console.log(banner, bannerStyle);

const runOnDomReady = (action = () => {}) => {
    printBanner();
    window.removeEventListener('DOMContentLoaded', runOnDomReady);
    action();
};

export const isDomLoaded = () => APP_DOM_LOADED_STATES.includes(document.readyState) && document.body;

export const onDomReady = (action = () => {}) => {
    // Run later
    window.addEventListener('DOMContentLoaded', runOnDomReady(action), false);
    // Or run now
    if (isDomLoaded()) runOnDomReady(action);
};

export default onDomReady;
