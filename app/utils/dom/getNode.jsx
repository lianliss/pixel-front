'use strict';

import {
    APP_DOM_ID,
    APP_DOM_CLASS,
} from 'const';

export const getAppNode = () => {
    const node = document.getElementById(APP_DOM_ID);
    const nodes = document.querySelectorAll(APP_DOM_CLASS);

    return node ? [node, ...nodes] : nodes;
};

export default getAppNode;
