import './TokenSelect.scss';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import ReactScrollableList from 'react-scrollable-list';
import Web3 from 'web3/dist/web3.min.js';
import wei from 'utils/wei';
import getFinePrice from 'utils/getFinePrice';
import { classNames as cn } from 'utils';
import { SwitchTabs, SectionBlock, WalletIcon } from 'ui';
import {Icon, Card} from '@blueprintjs/core';

const web3 = new Web3();

class TokenSelect extends React.PureComponent {
  state = {
    search: '',
    switchTabsSelected: 'tokens',
  };

  constructor(props) {
    super(props);
    this.state.switchTabsSelected = props.defaultList;
  }

  onSearchInput = (event) => {
    this.setState({
      search: event.target.value,
    });
  };

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
    const { search, switchTabsSelected } = this.state;
    const isTokens = switchTabsSelected === 'tokens';
    const isFiats = switchTabsSelected === 'fiats';

    const filtered = (isTokens ? tokens : fiats)
      .filter(
        (token) =>
          token.symbol.toUpperCase().indexOf(search.toUpperCase()) >= 0 ||
          token.name.toUpperCase().indexOf(search.toUpperCase()) >= 0
      )
      .sort(
        (a, b) =>
          (b.balance && b.balance !== '0') - (a.balance && a.balance !== '0')
      )
      .map((token) => {
        const { symbol, name, logoURI, price, balance } = token;
        const key = getTokenBalanceKey(token, accountAddress);
        //const balance = _.get(this.props, key);
        const balanceNumber = balance
          ? Number(wei.from(balance, token.decimals))
          : null;

        return {
          id: key,
          content: (
            <div
              className="TokenSelect__token"
              key={key}
              onClick={() => onChange(token)}
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
            <div className="TokenSelect__search">
              <input
                type="text"
                value={search}
                placeholder={"Search"}
                onChange={this.onSearchInput.bind(this)}
              />
              <Icon icon="search" />
            </div>
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
