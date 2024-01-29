'use strict';

const APP_DOM_LOADED_STATES = ['complete', 'loaded', 'interactive'];

const banner = '%cHello Pixel';
const bannerStyle = [
    'background:#001529',
    'color: #A62CFF',
    'width: 100%',
    'padding:20px 40px',
    'margin: -5px 0',
    'text-transform: uppercase',
    'font-size: 18px',
    '-webkit-font-smoothing',
].join(';');
let isBannerReady = false;
const printBanner = () => {
    if (!isBannerReady) {
        console.log(banner, bannerStyle);
        isBannerReady = true;
    }
};

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
