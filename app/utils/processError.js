import {wei} from "app/utils/index";

const processError = (error) => {
  const { message } = error;
  try {
    if (message.indexOf('Internal JSON-RPC error.') >= 0) {
      const internal = JSON.parse(message.split('Internal JSON-RPC error.')[1]);
      return {
        message: internal.message,
        isRpc: true,
      };
    } else {
      if (message.indexOf('insufficient funds for gas') >= 0) {
        const want = message.split('want ')[1].split(' (')[0];
        return {
          message,
          isGas: true,
          gas: wei.from(want),
        };
      } else {
        return {
          message,
        };
      }
    }
  } catch (err) {
    console.log('[processError]', err, error);
    return {
      message,
    };
  }
};

export default processError;
