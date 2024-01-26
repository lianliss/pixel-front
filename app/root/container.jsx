'use strict';
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {BrowserRouter, Route, Switch} from "react-router-dom";
import LoadModule from 'utils/async/load-module';
import {} from 'slices/App';
import _ from 'lodash';
import getCookie from 'utils/get-cookie';
import {appUpdateAccount} from 'slices/App';
import Router from './router';
import 'process';

class AppContainer extends React.PureComponent {
  static displayName = 'AppContainer';
  
  initialAccountData = null;
  
  state = {
    isAccountGet: true,
  };
  
  componentDidMount() {
    this.getAccountData();
  }
  
  async getAccountData() {
    const {appUpdateAccount} = this.props;
    try {
    
    } catch (error) {
      console.error('[getAccountData]', error);
    }
    this.setState({isAccountGet: true});
  }
  
  render() {
    const {account} = this.props;
    
    if (!this.state.isAccountGet) {
      return <div className="container bp5-dark">
        {LoadModule.renderLoading()}
      </div>;
    }
    
    return (
      <div className="container bp5-dark">
        <Router />
      </div>
    );
  }
}

export default connect(state => ({
  account: _.get(state, 'App.account'),
}), dispatch => bindActionCreators({
  appUpdateAccount,
}, dispatch), null, {pure: true})(AppContainer);
