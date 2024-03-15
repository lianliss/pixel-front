import React from 'react';
import styles from './Icons.module.scss';
import {Icon as BP} from "@blueprintjs/core";
import routes from 'const/routes';
import {useNavigate} from 'react-router-dom';
import {TelegramContext} from "services/telegramProvider";

import P2pIcon from './components/p2p';
import ExchangeIcon from './components/exchange';
import NftIcon from './components/nft';
import SoulIcon from './components/soul';

function Icons() {
  
  const navigate = useNavigate();
  const {
    setBackAction,
    haptic,
  } = React.useContext(TelegramContext);
  
  const icons = [
    {
      text: 'P2P',
      Icon: P2pIcon,
      route: routes.p2p,
    },
    {
      text: 'Exchange',
      Icon: ExchangeIcon,
      route: routes.exchange,
    },
    {
      text: 'NFT',
      Icon: NftIcon,
      route: routes.nftMarket,
    },
    {
      text: 'Digital Soul',
      Icon: SoulIcon,
      route: routes.p2p,
    },
  ];
  
  return <div className={styles.icons}>
    {icons.map(({text, Icon, route}, index) => {
      const id = `wallet-icon-${index}`;
      const {path, disabled} = route;
      const classNames = [
        styles.icon,
      ];
      if (disabled) {
        classNames.push('disabled');
      }
      return <div className={classNames.join(' ')}
                  onClick={() => {
                    if (!disabled) {
                      haptic.medium();
                      navigate(path);
                      setBackAction(() => {
                        navigate(routes.wallet.path);
                      })
                    }
                  }}
                  key={id}>
        <div className={styles.iconImageWrap}>
          <Icon />
        </div>
        <div className={styles.iconTitle}>
          {text}
        </div>
      </div>
    })}
  </div>
}

export default Icons;
