import React from 'react';
import styles from './Token.module.scss';
import {useMatch, useNavigate} from 'react-router-dom';
import routes from 'const/routes';
import {Web3Context} from "services/web3Provider";
import getFinePrice from "utils/getFinePrice";
import P2p from "lib/Wallet/components/Icons/P2p";
import Swap from "lib/Wallet/components/Icons/Swap";
import Nft from "lib/Wallet/components/Icons/Nft";
import Transfer from "lib/Wallet/components/Icons/Transfer";
import WalletBlock from "lib/Wallet/components/WalletBlock/WalletBlock";
import {TelegramContext} from "services/telegramProvider";
import History from "lib/Wallet/components/History/History";

function Token(props) {
  
  const navigate = useNavigate();
  const routePath = routes.walletToken.path;
  const match = useMatch(routePath);
  const {setBackAction} = React.useContext(TelegramContext);
  const {symbol} = match.params;
  const {tokens} = React.useContext(Web3Context);
  
  const [token, setToken] = React.useState();
  React.useEffect(() => {
    setToken(tokens.find(t => t.symbol === symbol));
  }, [symbol, tokens]);
  if (!token) return <></>;
  
  const {name, logoURI, balance, price} = token;
  
  const icons = [
    {
      text: 'P2P',
      Icon: P2p,
      route: routes.p2p,
    },
    {
      text: 'Exchange',
      Icon: Swap,
      route: routes.exchange,
    },
    {
      text: 'Transfer',
      Icon: Transfer,
      route: routes.walletTokenTransfer,
    },
  ];
  
  return <div className={styles.token}>
    <div className={styles.tokenHeader}>
      <div className={styles.tokenHeaderTitle}>
        <div className={styles.tokenHeaderTitleIcon}>
          <img src={logoURI} alt={symbol} />
        </div>
        <div className={styles.tokenHeaderTitleSymbol}>
          {name}
        </div>
      </div>
      <div className={styles.tokenHeaderPrice}>
        1 {symbol} ≈ ${getFinePrice(Number(price) || 0)}
      </div>
    </div>
    <div className={styles.tokenContainer}>
      <div className={styles.tokenBalance}>
        <div className={styles.tokenBalanceAmount}>
          {getFinePrice(Number(balance) || 0)}
        </div>
        <div className={styles.tokenBalanceValue}>
          ≈ ${getFinePrice(0)}
        </div>
      </div>
      <div className={styles.tokenIcons}>
        {icons.map(({text, Icon, route}, index) => {
          const id = `wallet-icon-${index}`;
          const {path, disabled} = route;
          const classNames = [
            styles.tokenIcon,
          ];
          if (disabled) {
            classNames.push('disabled');
          }
          return <WalletBlock className={classNames.join(' ')}
                              onClick={() => {
                                if (!disabled) {
                                  navigate(path);
                                  setBackAction(() => {
                                    navigate(routes.walletToken.path.replace(':symbol', symbol));
                                  })
                                }
                              }}
                              key={index}>
            <div className={styles.tokenIconImageWrap}>
              <div className={styles.tokenIconImage}
                   style={{
                     clipPath: `url(#${id})`
                   }}>
                <Icon id={id} size={64} />
              </div>
            </div>
            <div className={styles.tokenIconTitle}>
              {text}
            </div>
          </WalletBlock>
        })}
      </div>
      <History token={token} />
    </div>
  </div>
}

export default Token;
