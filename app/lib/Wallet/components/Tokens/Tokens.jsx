import React from 'react';
import styles from './Tokens.module.scss';
import WalletBlock from "lib/Wallet/components/WalletBlock/WalletBlock";
import {Web3Context} from "services/web3Provider";
import getFinePrice from "utils/getFinePrice";
import {Icon} from "@blueprintjs/core";
import {useNavigate} from "react-router-dom";
import routes from "const/routes";

function Tokens() {
  
  const {tokens} = React.useContext(Web3Context);
  const navigate = useNavigate();
  
  return <div className={styles.tokens}>
    {tokens.map((token, index) => {
      const {logoURI, balance, symbol, name} = token;
      
      const route = routes.walletToken.path.replace(':symbol', symbol);
      
      return <WalletBlock className={styles.token}
                          onClick={() => {
                            navigate(route);
                          }}
                          key={index}>
        <div className={styles.tokenInfo}>
          <div className={styles.tokenInfoIcon}>
            <img src={logoURI} alt={symbol} />
          </div>
          <div className={styles.tokenInfoTitle}>
            <div className={styles.tokenInfoTitleSymbol}>
              {symbol}
            </div>
            <div className={styles.tokenInfoTitleName}>
              {name}
            </div>
          </div>
        </div>
        <div className={styles.tokenBalance}>
          <div className={styles.tokenBalanceText}>
            <div className={styles.tokenBalanceTextAmount}>
              {getFinePrice(Number(balance) || 0)} {symbol}
            </div>
            <div className={styles.tokenBalanceTextValue}>
              ${getFinePrice(0)}
            </div>
          </div>
          <div className={styles.tokenBalanceAction}>
            <Icon icon={'chevron-right'} />
          </div>
        </div>
      </WalletBlock>
    })}
  </div>
}

export default Tokens;
