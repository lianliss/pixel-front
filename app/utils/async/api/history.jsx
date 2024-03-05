'use strict';
import Api from 'utils/async/api';
import {DEFAULT_CHAIN} from "services/multichain/chains";
const api = new Api('/api/history/');

const methods = {
  getTokenHistory: async (accountAddress, tokenAddress, chainId = DEFAULT_CHAIN) => {
    try {
      const response = await api.get('token', {
        params: {accountAddress, tokenAddress, chainId},
      });
      return response.message === 'OK'
        ? response.result
        : [];
    } catch (error) {
      console.error('[getTokenHistory]', error);
      return [];
    }
  },
  getHistory: async (accountAddress, chainId = DEFAULT_CHAIN) => {
    try {
      const response = await api.get('', {
        params: {accountAddress, chainId},
      });
      return response.message === 'OK'
        ? response.result.filter(e => e.input.length <= 2)
        : [];
    } catch (error) {
      console.error('[getHistory]', error);
      return [];
    }
  },
};

export default methods;
