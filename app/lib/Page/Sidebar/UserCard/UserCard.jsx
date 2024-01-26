'use strict';
import React from 'react';
import { classNames as cn } from 'utils';
import {
  Link,
} from "react-router-dom";

import styles from './UserCard.module.scss';
import userImage from 'assets/img/avatar.png';

import { Button } from "@blueprintjs/core";

function UserCard() {
  return <div className={styles.userCard}>
    <div className={styles.userCardOverview}>
      <div className={styles.userCardImage}>
        <img src={userImage} />
      </div>
      <div className={styles.userCardData}>
        <Button rightIcon="chevron-down"
                minimal
                text="Anonymous Shark" />
        <div className={styles.userCardDataProgressBar}>
          <div className={styles.userCardDataProgress} style={{
            width: "20%",
          }} />
        </div>
        <div className={styles.userCardDataRating}>
          <span>Level 5</span>
          <span>1000 / 5000</span>
        </div>
      </div>
    </div>
    <div className={styles.userCardDataActions}>
      <Button icon="buggy"
              text="Quests" />
      <Button icon="star-empty"
              text="Rewards" />
    </div>
  </div>
}

export default UserCard;
