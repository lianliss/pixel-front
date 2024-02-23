import './TokenSelect.scss';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactScrollableList from 'react-scrollable-list';
import {isAddress as web3IsAddress, toChecksumAddress} from 'web3-utils';
import wei from 'utils/wei';
import getFinePrice from 'utils/getFinePrice';
import { classNames as cn } from 'utils';
import { SwitchTabs, SectionBlock, WalletIcon, Button, } from 'ui';
import {Icon, Card, Spinner} from '@blueprintjs/core';
import {Web3Context} from 'services/web3Provider';
import get from 'lodash/get';

class TokenSelect extends React.PureComponent {
  static contextType = Web3Context;
  
  state = {
    search: '',
    switchTabsSelected: 'tokens',
    isAddress: false,
    isNewAddress: false,
    newToken: null,
  };

  constructor(props) {
    super(props);
    this.state.switchTabsSelected = props.defaultList;
  }

  onSearchInput = (value) => {
    const {tokens, fiats} = this.props;
    const {customTokens, initCustomToken, isConnected} = this.context;
    const isAddress = web3IsAddress(value);
    let isNewAddress;
    if (isAddress && isConnected) {
      const address = toChecksumAddress(value);
      isNewAddress = !([...customTokens, ...tokens, ...fiats].find(t => t.address === address));
      if (isNewAddress) {
        initCustomToken(value).then(token => {
          if (token) {
            this.setState({
              newToken: token,
            })
          }
        });
      }
    }
    
    this.setState({
      search: value,
      isAddress,
      isNewAddress,
      newToken: null,
    });
  };
  
  onSubmit = (event, filtered = []) => {
    event.preventDefault();
    const {isAddress, isNewAddress, newToken} = this.state;
    const {addCustomToken} = this.context;
    if (isAddress && isNewAddress && newToken) {
      addCustomToken(newToken);
      this.props.onChange(newToken);
    } else {
      if (!isNewAddress && filtered.length) {
        this.props.onChange(filtered[0].token);
      }
    }
  }

  componentDidMount() {
    this._mounted = true;
    if (this.props.loadAccountBalances) {
      this.props.loadAccountBalances();
    }

    document.addEventListener('click', this.__handleOutClick);
  }

  componentWillUnmount() {
    this._mounted = false;

    document.removeEventListener('click', this.__handleOutClick);
  }

  // @param {object} Event
  // Close modal if click was been modal out.
  __handleOutClick = (e) => {
    if (!this.tokenSelectRef) return;

    if (!this.tokenSelectRef.contains(e.target)) {
      this.props.onClose();
    }
  };

  render() {
    const {
      onChange,
      onClose,
      isAdaptive,
      tokens,
      fiats,
      accountAddress,
      getTokenBalanceKey,
      selected,
      commonBases,
      disableSwitcher,
      disableCommonBases,
      size,
      disableName,
      disableSymbol,
    } = this.props;
    const {
      search,
      switchTabsSelected,
      isAddress,
      isNewAddress,
      newToken,
    } = this.state;
    const {
      customTokens, isConnected,
    } = this.context;
    const isTokens = switchTabsSelected === 'tokens';
    const isFiats = switchTabsSelected === 'fiats';

    const checkSumAddress = isAddress
      ? toChecksumAddress(search)
      : '';
    const filtered = (isTokens
      ? [...tokens]
      : fiats)
      .filter(
        (token) =>
          isAddress
            ? token.address === checkSumAddress
            : token.symbol.toUpperCase().indexOf(search.toUpperCase()) >= 0
              || token.name.toUpperCase().indexOf(search.toUpperCase()) >= 0
      )
      .sort(
        (a, b) =>
          (b.balance && b.balance !== '0') - (a.balance && a.balance !== '0')
      )
      .map((token) => {
        const { symbol, name, logoURI, price, balance } = token;
        const key = getTokenBalanceKey(token, accountAddress);
        //const balance = get(this.props, key);
        const balanceNumber = balance
          ? Number(wei.from(balance, token.decimals))
          : null;

        return {
          id: key,
          token,
          content: (
            <div
              className="TokenSelect__token"
              key={key}
              onClick={e => isNewAddress && newToken
                ? this.onSubmit(e)
                : onChange(token)}
            >
              <div className="TokenSelect__token-left">
                <div
                  className="TokenSelect__token-icon"
                  style={{
                    backgroundImage: `url('${logoURI}')`,
                  }}
                />
                <div className="TokenSelect__token-name">
                  {!disableSymbol && <span>{symbol}</span>}
                  {!disableName && <span>{name}</span>}
                </div>
              </div>
              <div className="TokenSelect__token-right">
                <div className="TokenSelect__token-price">
                  {(!!price && !!balanceNumber) && `$${getFinePrice(price * balanceNumber)}`}
                </div>
                <div className="TokenSelect__token-balance">
                  {!!balanceNumber && getFinePrice(balanceNumber)}
                </div>
              </div>
            </div>
          ),
        };
      });

    return (
      <Card
        className={`TokenSelect__wrap TokenSelect-${size}`}
        ref={(element) => (this.tokenSelectRef = element)}
      >
        <div>
          <div className="TokenSelect">
            <h2>
              <span>Select token</span>
              <span className="TokenSelect__close" onClick={onClose}>
                <Icon icon="cross" />
              </span>
            </h2>
            <form className="TokenSelect__search" onSubmit={e => this.onSubmit(e, filtered)}>
              <input
                type="text"
                value={search}
                placeholder={isConnected ? "Search or address" : "Search"}
                onChange={event => this.onSearchInput.bind(this)(event.target.value)}
              />
              <Icon icon="search" />
            </form>
            {(isAddress && isNewAddress)
             ? <SectionBlock>
                {!!newToken ? <div className="TokenSelect__list">
                  <h3>
                    Add Custom Token
                  </h3>
                  <ReactScrollableList
                    listItems={[{
                      id: 'newToken',
                      token: newToken,
                      content: (
                        <div
                          className="TokenSelect__token"
                          key={'newToken'}
                          onClick={e => this.onSubmit(e)}
                        >
                          <div className="TokenSelect__token-left">
                            <div
                              className="TokenSelect__token-icon"
                              style={{
                                backgroundImage: `url('${newToken.logoURI}')`,
                              }}
                            />
                            <div className="TokenSelect__token-name">
                              {!disableSymbol && <span>{newToken.symbol}</span>}
                              {!disableName && <span>{newToken.name}</span>}
                            </div>
                          </div>
                          <div className="TokenSelect__token-right">
                            <Button onClick={e => this.onSubmit(e)}>
                              Add token
                            </Button>
                          </div>
                        </div>
                      ),
                    }]}
                    heightOfItem={54}
                    maxItemsToRender={10}
                  />
                </div> : <Spinner />}
            </SectionBlock>
            : <>
                {!disableSwitcher && <SwitchTabs
                  selected={switchTabsSelected}
                  onChange={(value) => this.setState({ switchTabsSelected: value })}
                  tabs={[
                    { value: 'fiats', label: "Fiats" },
                    { value: 'tokens', label: "Tokens" },
                  ]}
                  type="light-blue"
                  size="medium"
                />}
                {(!disableCommonBases && isTokens) && <SectionBlock className="TokenSelect__fiat" title="Common bases">
                  {tokens.filter((token) => {
                    const symbol = token.symbol.toUpperCase();
                    
                    for (let i = 0; i < commonBases.length; i++) {
                      if (symbol === commonBases[i].toUpperCase()) {
                        return true;
                      }
                    }
                  })
                    .map((token, key) => {
                      const active = token.symbol === selected.symbol;
                      
                      return (
                        <div
                          key={key}
                          onClick={() => onChange(token)}
                          className={cn(`TokenSelect__fiat__item`, { active })}
                        >
                          <WalletIcon currency={token} size={16} />
                          {token.symbol.toUpperCase()}
                        </div>
                      );
                    })}
                </SectionBlock>}
                <div className="TokenSelect__list">
                  <h3>
                    {isTokens && "Tokens list"}
                    {isFiats && 'List'}
                  </h3>
                  {!!filtered.length && <ReactScrollableList
                    listItems={filtered}
                    heightOfItem={54}
                    maxItemsToRender={10}
                  />}
                </div>
                {!filtered.length && 'Coming soon'}
            </>}
          </div>
        </div>
      </Card>
    );
  }
}

TokenSelect.defaultProps = {
  size: 'medium',
  fiats: [],
  tokens: [],
  defaultList: 'tokens',
};

TokenSelect.propTypes = {
  size: PropTypes.oneOf(['medium', 'small']),
  fiats: PropTypes.array,
  tokens: PropTypes.array,
  defaultList: PropTypes.oneOf(['fiats', 'tokens']),
};

export default connect((state) => ({
  isAdaptive: state.App.adaptive,
}))(TokenSelect);
