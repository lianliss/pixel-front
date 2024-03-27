'use strict';
import React from 'react';
import {useNavigate} from "react-router-dom";
import {Web3Context} from "services/web3Provider";
import {ModalContext} from "services/ModalProvider";
import styles from './Airdrop.module.scss';
import {Button} from 'ui';

function Airdrop() {
  const modal = React.useContext(ModalContext);
  const context = React.useContext(Web3Context);
  const {isConnected} = context;
  return <div className={styles.airdrop}>
    <h1>
      Pixel Airdrop
    </h1>
    <h2>
      Introducing HELLO PIXEL
    </h2>
    <p>
      HELLO PIXEL is an innovative ecosystem combining social networking with gaming elements, known as a socialfi platform. It incorporates NFT-Craft mechanics, allowing users to engage in crafting unique digital assets known as Non-Fungible Tokens (NFTs).
    </p>
    <h2>
      Tokenomics & Utility
    </h2>
    <p>
      The ecosystem's native cryptocurrency is the PIXEL token, which serves multiple purposes:
    </p>
    <ul>
      <li>
        <b>Dividend Receival:</b> Holders can earn dividends through various products within the ecosystem.
      </li>
      <li>
        <b>NFT Crafting:</b> Users can craft NFTs in the Pixel Forge by burning PIXEL tokens, generating value within the ecosystem.
      </li>
    </ul>
    <div className={styles.airdropImages}>
      <div className={styles.airdropImagesItem}>
        <img src={require('assets/img/airdrop1.jpg')} alt={""} />
      </div>
      <div className={styles.airdropImagesItem}>
        <img src={require('assets/img/airdrop2.jpg')} alt={""} />
      </div>
    </div>
    <h2>
      Phased Events
    </h2>
    <p>
      The project will unfold in several discrete phases, each marked by events and opportunities for participants to earn unique rewards.
    </p>
    <h2>
      NFT Staking with Cyber Hamster
    </h2>
    <p>
      The Cyber Hamster is an example of a "creature" NFT. Creatures like this have the special ability to help users generate Pixel tokens through the NFT Staking process.
    </p>
    <h2>
      4 Ways to Generate PIXEL Tokens
    </h2>
    <ul>
      <li>
        <b>Initial Purchase:</b> Buying PIXEL tokens from the initial liquidity pool at the Token Generation Event (TGE).
      </li>
      <li>
        <b>Creature Mining:</b> Using "creature" NFTs to mine PIXEL tokens.
      </li>
      <li>
        <b>Material Scrapping:</b> Collecting materials from a Pixel Extractor and converting them into PIXEL tokens.
      </li>
      <li>
        <b>A Secret Method:</b> An undisclosed method of generating PIXEL tokens that users must discover on their own.
      </li>
    </ul>
    <h2>
      Cross-Chain Presence
    </h2>
    <p>
      The HELLO PIXEL project will initiate its journey on the Flare and Songbird networks, extending its reach across multiple blockchain platforms.
    </p>
    <center>
      {isConnected
        ? <>
          <Button
            large
            icon={"box"}
            className=""
            disabled
          >
            Participate in Airdrop
          </Button>
          <small>
            {/*Will be active in 7 days*/}
          </small>
        </>
        : <Button
          large
          primary
          icon={"antenna"}
          className=""
          onClick={() => modal.connectToWalletModal()}
        >
          Connect wallet
        </Button>}
    </center>
  </div>;
}

export default Airdrop;
