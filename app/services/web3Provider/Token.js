import { DEFAULT_DECIMALS } from 'services/multichain/initialTokens';

class Token {
  isFiat = false;
  balance = '0';
  price = 0;

  constructor(
    name,
    symbol,
    address,
    chainId,
    decimals,
    logoURI = null,
    isCustom = false,
    price = 0,
    ) {
    this.name = name;
    this.symbol = symbol;
    this.address = address;
    this.chainId = chainId;
    this.decimals = decimals || DEFAULT_DECIMALS;
    this.logoURI = logoURI;
    this.isCustom = isCustom;
    this.price = price;
  }
}

class FiatToken extends Token {
  isFiat = true;

  constructor(name, symbol, address, chainId, decimals, logoURI) {
    super(name, symbol, address, chainId, decimals, logoURI);
  }
}

class BaseChainToken extends Token {
  isBaseChainToken = true;

  constructor(name, symbol, chainId, decimals, logoURI, price = 0) {
    super(name, symbol, null, chainId, decimals, logoURI, false, price);
  }
}

export { Token, FiatToken, BaseChainToken };
