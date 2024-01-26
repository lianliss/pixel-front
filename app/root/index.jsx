'use strict';
import '@babel/polyfill';
import React, {Suspense} from 'react';
import {render} from 'react-dom';
import {createStore} from 'app/store';
import {
    ContextProvider,
    StrictMode,
} from './context';
import onDomReady from "app/utils/dom/on-dom-ready";
import getQueryParams from 'app/utils/get-query-params';
import getAppNode from 'app/utils/dom/getNode';
import LoadModule from 'utils/async/load-module';
import Web3Provider from "services/web3Provider";
import ModalProvider from "services/ModalProvider";

class Root extends React.PureComponent {
    static displayName = 'Root';

    store = createStore();

    static start(Container) {
        onDomReady(() => this.initialize(Container));
    }

    static initialize(Container) {
        if (!Container) throw new Error('missing [Container]');

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
            Container,
            className: 'app-root',
            queryData,
        };
        render(<Root {...props}/>, shadowNode);
    }

    render() {
        const {
            store,
            props: {
                Container,
                shadowNode,
            },
            className,
        } = this;
        const props = {
            store,
            container: Container,
            shadowNode,
            contextValues: {
                store,
                shadowNode
            }
        };
        return (
            <StrictMode disabled>
                <LoadModule root="context" {...props}>
                    <Web3Provider>
                        <ModalProvider>
                            <Container />
                        </ModalProvider>
                    </Web3Provider>
                </LoadModule>
            </StrictMode>
        );
    }
}

export default Root;

