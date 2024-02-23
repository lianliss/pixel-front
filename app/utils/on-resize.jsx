'use strict';
import debounce from 'lodash/debounce';

const INTERVAL_UNTIL_RECEIVE_FIRST_SIZE = 500;
const onResizeListeners = [];

/**
 * Add listener to element resize
 * @param element
 * @param listener
 */
const onResize = (element, listener)=> {
    onResizeListeners.push(listener);
    window.addEventListener('resize', debounce(() => {
        listener();
        setTimeout(() => listener(), 250);
    }, 250));
    // Wait until css loads and give a first size to the element
    let intervalBeforeFirstSizeReceived = setInterval(() => {
        if (element.clientWidth) {
            clearInterval(intervalBeforeFirstSizeReceived);
            onResizeListeners.reverse().map(current => current());
        }
    }, INTERVAL_UNTIL_RECEIVE_FIRST_SIZE);
};

export const dispatchResize = () => onResizeListeners.reverse().map(current => current());

export default onResize;
