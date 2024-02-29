import React, {lazy, Suspense} from 'react';
import loading from 'styles/svg/loading.svg';
import {
  OverlayToaster,
} from '@blueprintjs/core';

const toaster = OverlayToaster.create({position: "top", usePortal: true});

export function Loading (props = {}) {
  const {text} = props;
  return <div className="module-loading">
    <img className="loading" src={loading}/>
    <div className="module-loading-text">
      {text || 'Loading'}
    </div>
  </div>
}

class LoadModule extends React.PureComponent {
  /**
   * Lazy loader for any lib module which path starts from 'lib/...'
   * @param lib {String} - module path after 'lib/'
   * @param root {String} - module path after 'root/'
   * @param modal {String} - module path after 'services/ModalProvider/Modals/'
   * @returns {XML}
   */
  
  static processError(error) {
    console.error('[LoadModule]', error);
    toaster.show({
      intent: 'danger',
      message: `Module load error. There is a new version available. Clearing cache...`,
      icon: 'error',
      timeout: 10000,
    });
    try {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
        //setTimeout(() => window.location.reload(true), 2000);
      });
    } catch (error) {
      console.error('[LoadModule] caches', error);
      toaster.show({
        intent: 'danger',
        message: `Can't clear cache automatically. Please clear the cache of your browser`,
        icon: 'error',
        timeout: 10000,
      });
    }
  }
  
  render() {
    const {lib, root, modal} = this.props;
    let LazyComponent;
    switch (true) {
      case !!root:
        LazyComponent = lazy(() => import(`root/${root}`).catch(LoadModule.processError));
        break;
      case !!modal:
        LazyComponent = lazy(() => import(`services/ModalProvider/Modals/${modal}`).catch(LoadModule.processError));
        break;
      case !!lib:
      default:
        LazyComponent = lazy(() => import(`lib/${lib}`).catch(LoadModule.processError));
    }
    
    return <Suspense fallback={Loading()}>
      <LazyComponent {...this.props} />
    </Suspense>
  }
  
}

export default LoadModule;
