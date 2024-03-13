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
import TokenHeader from "lib/Wallet/components/TokenHeader/TokenHeader";
import wei from "utils/wei";

function Token(props) {
  
  const navigate = useNavigate();
  const routePath = routes.walletToken.path;
  const match = useMatch(routePath);
  const {
    setBackAction,
    haptic,
  } = React.useContext(TelegramContext);
  const {symbol} = match.params;
  const {tokens} = React.useContext(Web3Context);
  
  const [token, setToken] = React.useState();
  React.useEffect(() => {
    setToken(tokens.find(t => t.symbol === symbol));
  }, [symbol, tokens]);
  if (!token) return <></>;
  
  const {name, logoURI, balance, price, decimals} = token;
  
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
      route: routes.walletTransfer,
    },
  ];
  
  return <div className={styles.token}>
    <TokenHeader token={token} />
    <div className={styles.tokenContainer}>
      <div className={styles.tokenBalance}>
        <div className={styles.tokenBalanceAmount}>
          {getFinePrice(wei.from(balance, decimals))}
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
                                  haptic.normal();
                                  navigate(path.replace(':symbol', symbol));
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
