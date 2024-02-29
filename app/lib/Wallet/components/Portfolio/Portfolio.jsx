import React from 'react';
import styles from './Portfolio.module.scss';
import {Button} from "ui";
import logo from 'styles/svg/logo_icon.svg';
import getFinePrice from "utils/getFinePrice";

function Portfolio() {
  return <div className={styles.portfolio}>
    <div className={styles.portfolioActions}>
      <div className={styles.portfolioActionsLeft}>
        <div className={styles.portfolioActionsIcon}>
          <img src={logo} alt={'logo'} />
        </div>
        <div className={styles.portfolioActionsTitle}>
          <div className={styles.portfolioActionsTitleTop}>
            Pixel
          </div>
          <div className={styles.portfolioActionsTitleBottom}>
            {getFinePrice(0)}
          </div>
        </div>
      </div>
      <div className={styles.portfolioActionsRight}>
        <Button large disabled>
          MINING
        </Button>
      </div>
    </div>
    <div className={styles.portfolioStorage}>
      <div className={styles.portfolioStorageText}>
        <div className={styles.portfolioStorageTextTitle}>
          Storage
        </div>
        <div className={styles.portfolioStorageTextStatus}>
          Not ready
        </div>
      </div>
      <div className={styles.portfolioStorageBar}>
        <div className={styles.portfolioStorageBarProgress} />
      </div>
    </div>
    <div className={styles.portfolioHarvested}>
      Harvested:
      <span>{getFinePrice(0)}</span>
    </div>
  </div>
}

export default Portfolio;
