import React from 'react';
import styles from './Preseed.module.scss';
import {Web3Context} from "services/web3Provider";
import {Button, Input, WalletBlock} from "ui";
import {ModalContext} from "services/ModalProvider";
import toaster from "services/toaster";
import ABI from "const/ABI/PXLPreseed";
import {TelegramContext} from "services/telegramProvider";
import {wei} from "utils";
import getFinePrice from "utils/getFinePrice";
import {IS_TELEGRAM} from "const";
import TokenHeader from "lib/Wallet/components/TokenHeader/TokenHeader";

function Preseed() {

  const {
    isConnected,
    chainId,
    network,
    switchToChain,
    getContract,
    accountAddress,
    tokens,
    getTokenContract,
    transaction,
  } = React.useContext(Web3Context);
  const {
    connectToWalletModal,
  } = React.useContext(ModalContext);
  const {
    telegramFirstName,
    telegramLastName,
    telegramUserName,
    telegramId,
    haptic,
    setMainButton,
    hideMainButton,
    mainButtonLoading,
    mainButtonStop,
    mainButtonEnable,
    mainButtonDisable,
  } = React.useContext(TelegramContext);

  const telegramName = `${telegramFirstName || ''} ${telegramLastName || ''}`.trim();

  const [usdt, setUsdt] = React.useState();
  const [min, setMin] = React.useState();
  const [max, setMax] = React.useState();
  const [total, setTotal] = React.useState();
  const [invested, setInvested] = React.useState();
  const [investors, setInvestors] = React.useState();
  const [deposit, setDeposit] = React.useState();
  const [timestamp, setTimestamp] = React.useState();
  const [name, setName] = React.useState(telegramName);
  const [contact, setContact] = React.useState(telegramUserName);
  const [amount, setAmount] = React.useState(0);
  const [approved, setApproved] = React.useState(0);
  const [isApproving, setIsApproving] = React.useState(false);
  const [isInvesting, setIsInvesting] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  const minInvest = 30000;
  const isApproved = approved >= amount;
  const getIsValid = amount => {
    return !!amount
        && amount >= Math.floor(min)
        && amount <= Math.floor(max)
        && amount <= Math.floor(total - invested);
  }
  const isValid = getIsValid(amount);

  const onApprove = async (_val = amount) => {
    try {
      setIsApproving(true);
      const token = getTokenContract(usdt);
      console.log('token', token);
      const approved = await token.approve(network.contractAddresses.preseed, _val);
      setApproved(approved);
      toaster.success(`$${getFinePrice(approved)} approved for operation`);
      setIsApproving(false);
      return approved;
    } catch (error) {
      console.error('[Preseed][onApprove]', error);
      toaster.error(error.message);
      setIsApproving(false);
      return approved;
    }
  }

  const onInvest = async (_val = amount) => {
    try {
      setIsInvesting(true);
      const contract = await getContract(ABI, network.contractAddresses.preseed);
      console.log('[onInvest]', _val, wei.to(_val, usdt.decimals));
      const tx = await transaction(contract, 'invest', [
        wei.to(_val, usdt.decimals),
        name,
        contact,
      ])
      toaster.success(`$${getFinePrice(_val)} sent to contract`);
      setIsInvesting(false);
      return tx;
    } catch (error) {
      console.error('[Preseed][onInvest]', error);
      toaster.error(error.message);
      setIsInvesting(false);
      return false;
    }
  }

  const onTelegramInvest = async (_val) => {
    haptic.heavy();
    mainButtonLoading();
    mainButtonDisable();
    await onApprove(_val);
    await onInvest(_val);
    mainButtonStop();
    setAmount(0);
  }

  const onChangeAmount = amount => {
    setAmount(amount);
    if (IS_TELEGRAM) {
      setMainButton({
        onClick: () => onTelegramInvest(amount),
        isDisabled: !getIsValid(amount),
        isPrimary: true,
      })
    }
  }

  const loadData = async (usdt) => {
    try {
      setIsLoaded(false);
      const contract = await getContract(ABI, network.contractAddresses.preseed);
      const token = getTokenContract(usdt);
      const data = await Promise.all([
        contract.methods.getPreseedData().call(),
        contract.methods.getDeposit(accountAddress).call(),
        token.getAllowance(network.contractAddresses.preseed),
      ]);

      setMin(wei.from(data[0][0], usdt.decimals));
      setMax(wei.from(data[0][1], usdt.decimals));
      setTotal(wei.from(data[0][2], usdt.decimals));
      setInvested(wei.from(data[0][3], usdt.decimals));
      setInvestors(Number(data[0][4]));
      const deposit = wei.from(data[1].deposit, usdt.decimals);
      if (deposit) {
        setDeposit(deposit);
        setTimestamp(Number(data[1].depositTimestamp));
        setName(data[1].name);
        setContact(data[1].contact);
      }
      setApproved(data[2]);
      setMainButton({
        text: 'Deposit',
        isPrimary: true,
        onClick: onTelegramInvest,
      })
    } catch (error) {
      console.error('[Preseed][loadData]', error);
      toaster.error(error.message);
    }
    setIsLoaded(true);
  }

  React.useEffect(() => {
    if (!isConnected || chainId !== 137) {
      if (IS_TELEGRAM) {
        switchToChain(137);
        toaster.warning('Network changed to Polygon');
      }
      return;
    }

    const usdt = tokens.find(t => t.symbol === 'USDT');
    setUsdt(usdt);
    loadData(usdt);
    return () => {
      if (IS_TELEGRAM) {
        switchToChain(19);
        toaster.warning('Network changed to Songbird');
        hideMainButton();
      }
    }
  }, [chainId, isConnected, accountAddress]);

  const isAdmin = telegramId === 162131210 || telegramId === 24931187;

  const renderDepositTitle = () => {
    return <div className={styles.preseedDeposit}>
      <div className={styles.preseedDepositTitle}>
        Deposit
      </div>
      <div className={styles.preseedDepositRight}>
        {getFinePrice(min)} - {getFinePrice(max)}
      </div>
    </div>
  }

  const renderForm = () => {
    if (!isConnected) {
      return <div className={styles.preseedPolygon}>
        <p>
          Please connect your wallet
          <br/>to continue
        </p>
      </div>
    }
    if (chainId !== 137) {
      return <div className={styles.preseedPolygon}>
        <img src={'https://cryptologos.cc/logos/polygon-matic-logo.png'} alt={'Chain ID: 137'} />
        <p>
          PRE-SEED round is available
          <br/>only in Polygon network
        </p>
        <Button icon={'link'}
                onClick={() => switchToChain(137)}
                large>
          Switch to Polygon
        </Button>
      </div>
    } else {
      const isShow = isAdmin || invested >= minInvest;
      return <div className={styles.preseedForm}>
        <div className={styles.preseedRaised}>
          <p>
            {isShow ? 'Total fundraised' : 'Total round fundraise'}
          </p>
          <div className={styles.preseedRaisedValues}>
            {isShow && <div className={styles.preseedRaisedInvested}>
              ${getFinePrice(invested)}
            </div>}
            <div className={styles.preseedRaisedTotal}>
              ${getFinePrice(total)}
            </div>
          </div>
        </div>
        <div className={styles.preseedUserDeposit}>
          <small>
            You have invested
          </small>
          <span>
            ${getFinePrice(deposit)}
          </span>
        </div>
        <WalletBlock title={'Your name'}>
          <Input type={'text'}
                 onTextChange={setName}
                 value={name}
          />
        </WalletBlock>
        <WalletBlock title={'Your Telegram contact'}>
          <Input type={'text'}
                 disabled={IS_TELEGRAM}
                 onTextChange={setContact}
                 value={contact}
          />
        </WalletBlock>
        <WalletBlock title={renderDepositTitle()}>
          <Input type={'number'}
                 onTextChange={onChangeAmount}
                 positive
                 indicator={'USDT'}
                 max={max}
                 min={min}
                 value={amount}
          />
        </WalletBlock>
      </div>
    }
  }

  const renderButtons = () => {
    if (IS_TELEGRAM) {
      return <></>;
    }
    if (!isConnected) {
      return <Button
          large
          primary
          icon={"antenna"}
          onClick={() => connectToWalletModal()}
      >
        Connect wallet
      </Button>
    } else {
      if (chainId !== 137) {
        return <></>;
      }
      return <div className={styles.preseedButtons}>
        <Button
            large
            disabled={!amount || isApproved || !isValid}
            primary={!isApproved}
            loading={isApproving}
            icon={isApproved ? "unlock" : "lock"}
            onClick={() => onApprove()}
        >
          Approve USDT
        </Button>
        <Button
            large
            disabled={!isValid || !isApproved}
            primary={isApproved}
            loading={isInvesting}
            icon={"rocket-slant"}
            onClick={() => onInvest()}
        >
          Deposit
        </Button>
      </div>
    }
  }

  return <div className={styles.preseedWrap}>
    {(chainId === 137 && usdt && IS_TELEGRAM) && <TokenHeader gas showBalance token={usdt} />}
    <div className={styles.preseed}>
      <h1>
        Early investors
      </h1>
      <p>
        For early investors we offer to participate in the PRE-SEED round for which 2% of the maximum supply of our <a href={'https://docs.hellopixel.network/tokenomics/tokenomics'} target={"_blank"}>tokenomics</a> is allocated at the price of $0.01 per token.
        <br/>
        <a href={'https://docs.hellopixel.network/tokenomics/early-investors'} target={'_blank'}>Read more...</a>
      </p>
      {renderForm()}
      {renderButtons()}
    </div>
  </div>
}

export default Preseed;
