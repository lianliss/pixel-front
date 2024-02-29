import React from 'react';
import styles from './Icons.module.scss';
import {Icon as BP} from "@blueprintjs/core";
import P2p from './P2p';
import Swap from './Swap';
import Nft from './Nft';
import Soul from './Soul';
import routes from 'const/routes';
import {useNavigate} from 'react-router-dom';
import {TelegramContext} from "services/telegramProvider";

function Icons() {
  
  const navigate = useNavigate();
  const {setBackAction} = React.useContext(TelegramContext);
  
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
      text: 'NFT',
      Icon: Nft,
      route: routes.nftMarket,
    },
    {
      text: 'Digital Soul',
      Icon: Soul,
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
                      navigate(path);
                      setBackAction(() => {
                        try {
                          console.log('navigate');
                          navigate(routes.wallet.path);
                        } catch (error) {
                          console.error('BACK ACTION', error);
                        }
                      })
                    }
                  }}
                  key={id}>
        <div className={styles.iconImageWrap}>
          <div className={styles.iconImage}
               style={{
                 clipPath: `url(#${id})`
               }}>
            <Icon id={id} size={64} />
          </div>
        </div>
        <div className={styles.iconTitle}>
          {text}
        </div>
      </div>
    })}
  </div>
}

export default Icons;
