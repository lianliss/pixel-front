import wei from 'utils/wei';
import _ from 'lodash';
import NarfexOracleABI from 'const/ABI/NarfexOracle';
import significant from 'utils/significant';

const wait = miliseconds => new Promise(fulfill => setTimeout(fulfill, miliseconds));

class TokenContract {
  isAwaiting = false;
  pendingTimeout = 2000;

  constructor(token, provider, isPairContract = false) {
    Object.assign(this, token);
    this.provider = provider;
    this.web3 = provider.getWeb3();
    this.ethereum = provider.ethereum;
    this.network = provider.network;
    this.chainId = provider.network.chainId;
    this.allowance = null;

    this.contract = new (this.web3.eth.Contract)(
      isPairContract
        ? require('const/ABI/PancakePair')
        : require('const/ABI/Bep20Token'),
      this.address,
    );
  }

  getAllowance = (spender, account = this.provider.state.accountAddress) => new Promise((fulfill, reject) => {
    // Allow BNB
    if (!this.address) return fulfill(5 * 10**9);
    // Get contract allowance
    console.log('getAllowance', account, spender);
    this.contract.methods.allowance(
      account,
      spender,
    ).call().then(response => {
      this.allowance = wei.from(wei.bn(response), this.decimals);
      fulfill(this.allowance);
    }).catch(error => {
      console.error('[TokenContract][getAllowance]', error);
      fulfill(0);
    });
  });

  getBalance = (address = this.provider.state.accountAddress) => new Promise((fulfill, reject) => {
    this.contract.methods
      .balanceOf(address)
      .call()
      .then(response => {
        const balance = wei.from(response, this.decimals);
        fulfill(balance);
      }).catch(error => {
        console.error('[TokenContract][getBalance]', error);
        fulfill(0);
    })
  });

  getSymbol = async () => {
    if (this.address === '0x0000000000000000000000000000000000000000') return;
    return await this.contract.methods.symbol().call();
  };

  _pendingAllowance = async (spender, amount) => {
    if (!this.isAwaiting) return false;
    const prevAllowance = this.allowance;
    const allowance = await this.getAllowance(spender);
    if (allowance === prevAllowance) {
      await wait(this.pendingTimeout);
      return await this._pendingAllowance(spender, amount);
    } else {
      return true;
    }
  };

  waitApprove = async (spender, amount) => {
    this.isAwaiting = true;
    return await this._pendingAllowance(spender, amount);
  };

  stopWaiting = () => this.isAwaiting = false;

  transaction = async (method, params, value = 0) => {
    return await this.provider.transaction(this.contract, method, params, value);
  };

  approve = async (spender, amount) => {
    try {
      const txHash = await this.transaction('approve', [spender, wei.to(amount, this.decimals)]);
      console.log('[approve]', this.provider.getBSCScanLink(txHash));
      const receipt = await this.provider.getTransactionReceipt(txHash);
      console.log('[approve]', receipt);
      await this.waitApprove(spender, amount);
      return amount;
    } catch (error) {
      this.stopWaiting();
      throw error;
    }
  };
  
  _updateTokensData = async (tokens) => {
    try {
      const oracleContract = new (this.web3.eth.Contract)(
        NarfexOracleABI,
        this.network.contractAddresses.narfexOracle,
      );
      const tokensData = (await oracleContract.methods.getTokensData(tokens.map(t => t.address), false).call())
        .map((tokenData, index) => {
        const token = tokens[index];
        this.provider.oracleTokens[token.address] = Object.assign(
          this.provider.getTokenContract(token),
          {
            price: wei.from(tokenData.price, token.decimals),
            commission: wei.from(tokenData.commission, 4),
            transferFee: wei.from(tokenData.transferFee, 4),
            isFiat: tokenData.isFiat,
          });
      });
    } catch (error) {
      console.error('[TokenContract][_updateTokensData]', tokens.map(t => t.address), error);
    }
  };
  
  _getFiatExchange = (token0, token1) => {
    const rate = token0.price / token1.price;
    const commission = (token0.commission + 1) * (token1.commission + 1) - 1;
    console.log('_getFiatExchange', token0.symbol, token1.symbol, {
      token0, token1, rate, commission
    });
    return {rate, commission};
  };
  
  _getFiatExchangeOut = (token0, token1, inAmount) => {
    const {rate, commission} = this._getFiatExchange(token0, token1);
    return inAmount * rate * (1 - commission);
  };
  
  _getFiatExchangeIn = (token0, token1, outAmount) => {
    const {rate, commission} = this._getFiatExchange(token0, token1);
    return outAmount / rate * (1 + commission);
  };
  
  _getExchangeTokens = async secondToken => {
    if (!this.provider.oracleTokens) this.provider.oracleTokens = {};
    const {oracleTokens} = this.provider;
    
    const current = this.address ? this : this.network.wrapToken;
    const second = secondToken.address ? secondToken : this.network.wrapToken;
    const networkUSDC = this.network.tokens.usdc;
    
    if (!oracleTokens[current.address]
      || !oracleTokens[second.address]
      || !oracleTokens[networkUSDC.address]) {
      await this._updateTokensData([current, second, networkUSDC]);
    }
    
    return {
      token0: oracleTokens[current.address],
      token1: oracleTokens[second.address],
      usdc: oracleTokens[networkUSDC.address],
    }
  };
  
  _getDEXResult = async (token0, token1, amount, isExactIn = true, maxHops = 3) => {
    const pairs = await this.provider.getPairs(token0, token1, maxHops);
    const trade = this.provider.getTrade(pairs, token0, token1, amount, isExactIn);
    const transferFee = (token0.transferFee + 1) * (token1.transferFee + 1) - 1;
    const priceImpact = significant(trade.priceImpact.asFraction);
    return {
      inAmount: isExactIn ? amount : significant(trade.inputAmount) * (1 + transferFee),
      outAmount: isExactIn ? significant(trade.outputAmount) * (1 - transferFee) : amount,
      path: trade.route.path,
      priceImpact
    };
  };
  
  getOutAmount = async (secondToken, inAmount, maxHops = 3) => {
    try {
      const {token0, token1, usdc} = await this._getExchangeTokens(secondToken);
      
      if (
        (token0.isFiat && token1.isFiat)
        || token0.isFiat && token1.address === usdc.address
        || token1.isFiat && token0.address === usdc.address
        ) {
        /// Exchange between two fiats or fiat with USDC
        return {
          inAmount,
          outAmount: this._getFiatExchangeOut(token0, token1, inAmount),
          path: [token0, token1],
        }
      }
      if (!token0.isFiat && !token1.isFiat) {
        // Only DEX exchange
        return await this._getDEXResult(token0, token1, inAmount, true, maxHops);
      }
      if (token0.isFiat) {
        // Exchange from fiat to coin
        const usdcAmount = this._getFiatExchangeOut(token0, usdc, inAmount);
        const dexResult = await this._getDEXResult(usdc, token1, usdcAmount, true, maxHops);
        return {
          ...dexResult,
          inAmount,
          outAmount: dexResult.outAmount,
          path: [token0, ...dexResult.path],
        };
      } else {
        // Exchange from coin to fiat
        const dexResult = await this._getDEXResult(token0, usdc, inAmount, true, maxHops);
        return {
          ...dexResult,
          inAmount,
          outAmount: this._getFiatExchangeOut(usdc, token1, dexResult.outAmount, true),
          path: [...dexResult.path, token1],
        }
      }
    } catch (error) {
      console.error('[TokenContract][getOutAmount]', error);
      return null;
    }
  };
  
  getInAmount = async (secondToken, outAmount, maxHops = 3) => {
    try {
      const {token0, token1, usdc} = await this._getExchangeTokens(secondToken);
      
      if (
        (token0.isFiat && token1.isFiat)
        || token0.isFiat && token1.address === usdc.address
        || token1.isFiat && token0.address === usdc.address
      ) {
        /// Exchange between two fiats or fiat with USDC
        return {
          inAmount: this._getFiatExchangeIn(token0, token1, outAmount),
          outAmount,
          path: [token0, token1],
        }
      }
      if (!token0.isFiat && !token1.isFiat) {
        // Only DEX exchange
        return await this._getDEXResult(token0, token1, outAmount, false, maxHops);
      }
      if (token0.isFiat) {
        // Exchange from fiat to coin
        const dexResult = await this._getDEXResult(usdc, token1, outAmount, false, maxHops);
        return {
          ...dexResult,
          inAmount: this._getFiatExchangeIn(token0, usdc, dexResult.inAmount),
          outAmount,
          path: [token0, ...dexResult.path],
        };
      } else {
        // Exchange from coin to fiat
        const usdcAmount = this._getFiatExchangeIn(usdc, token1, outAmount);
        const dexResult = await this._getDEXResult(token0, usdc, usdcAmount, false, maxHops);
        return {
          ...dexResult,
          inAmount: dexResult.inAmount,
          outAmount,
          path: [...dexResult.path, token1],
        }
      }
    } catch (error) {
      console.error('[TokenContract][getInAmount]', error);
      return null;
    }
  }
}

export default TokenContract;
