'use strict';
import '@babel/polyfill';
import React from 'react';
import {render} from 'react-dom';
import {createStore} from 'app/store';
import onDomReady from "app/utils/dom/on-dom-ready";
import getQueryParams from 'app/utils/get-query-params';
import getAppNode from 'app/utils/dom/getNode';
import LoadModule from 'utils/async/load-module';

class Root extends React.PureComponent {
    static displayName = 'Root';

    store = createStore();

    static start() {
        onDomReady(() => this.initialize());
    }

    static initialize() {

        const parentNodes = getAppNode();
        if (!parentNodes || !parentNodes.length) {
            throw new Error('Error initializing Store. Missing Application Placeholder Div.');
        }

        const meta = document.createElement('meta');
        meta.name = "viewport";
        meta.content = "initial-scale=1";
        document.getElementsByTagName('head')[0].appendChild(meta);

        const shadowNode = parentNodes[0];
        const queryData = getQueryParams(document.location.href);
        const props = {
            shadowNode,
            className: 'app-root',
            queryData,
        };
        render(<Root {...props}/>, shadowNode);
    }

    render() {
        const {
            store,
            props: {
                shadowNode,
            },
            className,
        } = this;
        const props = {
            store,
            shadowNode,
            contextValues: {
                store,
                shadowNode
            }
        };
        return (
          <LoadModule root="context" {...props}>
              <LoadModule root="container" />
          </LoadModule>
        );
    }
}

export default Root;

