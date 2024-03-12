'use strict';
import Api from 'utils/async/api';
import {DEFAULT_CHAIN} from "services/multichain/chains";
const api = new Api('/api/mining/');

const methods = {
  getMiningAccessUnsafe: async (params) => {
    try {
      return await api.get('unsafe', {
        params,
      });
    } catch (error) {
      console.error('[getMiningAccessUnsafe]', error);
      return;
    }
  },
};

export default methods;
