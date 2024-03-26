import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {Web3Context} from "services/web3Provider";
import {TelegramContext} from "services/telegramProvider";
import PXLsABI from "const/ABI/PXLs";
import {wei} from "utils";
import {appSetGasless} from "slices/App";
import toaster from "services/toaster";
import processError from "../utils/processError";
import {gaslessSelector} from "app/store/selectors";

let interval, _mined, start, _reward;

function useMining() {
  const dispatch = useDispatch();
  const {
    isConnected,
    loadAccountBalances,
    accountAddress,
    apiGetTelegramUser,
    apiClaim,
    setSettingsButton,
    getContract,
    network,
    tokens,
    transaction,
    apiGetAccessForce,
  } = React.useContext(Web3Context);
  const {
    privateKey,
    setPrivateKey,
    telegramId,
    telegramUserName,
    telegramFirstName,
    telegramLastName,
    clearBackActions,
    hideMainButton,
    haptic,
    getPrivateKey,
  } = React.useContext(TelegramContext);
  
  const [token, setToken] = React.useState();
  const [gasToken, setGasToken] = React.useState();
  const [claimed, setClaimed] = React.useState(0);
  const [mined, setMined] = React.useState(0);
  const [rewardPerSecond, setRewardPerSecond] = React.useState(0.00001);
  const [sizeLimit, setSizeLimit] = React.useState(100);
  const [timestamp, setTimestamp] = React.useState();
  const [isClaiming, setIsClaiming] = React.useState(true);
  const [sizeLevel, setSizeLevel] = React.useState(0);
  const [speedLevel, setSpeedLevel] = React.useState(0);
  const [useGasless, setUseGasless] = React.useState(window.localStorage.getItem('use-gasless') === 'true');
  const gasless = useSelector(gaslessSelector);
  
  React.useEffect(() => {
    if (!isConnected) return;
    const token = tokens.find(t => t.symbol === 'PXLs');
    const gasToken = tokens.find(t => !t.address);
    if (token) {
      setToken(token);
    }
    if (gasToken) {
      setGasToken(gasToken);
    }
  }, [isConnected, tokens]);
  
  const increaseMined = () => {
    const seconds = (Date.now() - start) / 1000;
    setMined(_mined + seconds * _reward);
    setTimestamp(Date.now());
  }
  
  const toggleUseGasless = () => {
    const newValue = !useGasless;
    window.localStorage.setItem('use-gasless', newValue);
    setUseGasless(newValue);
  }
  
  React.useEffect(() => {
    if (window.localStorage.getItem('use-gasless') === null) {
      toggleUseGasless();
    }
  }, [])
  
  const loadMiningData = async () => {
    try {
      const contract = await getContract(PXLsABI, network.contractAddresses.mining);
      let data = await Promise.all([
        contract.methods.getStorage(telegramId).call(),
      ]);
      if (!data[0].claimTimestamp || data[0].account !== accountAddress) {
        await apiGetAccessForce();
        toaster.success(`Access granted for a new address`);
        data = await Promise.all([
          contract.methods.getStorage(telegramId).call(),
        ]);
      }
      setClaimed(wei.from(data[0].balance));
      _mined = wei.from(data[0].mined);
      _reward = wei.from(data[0].rewardPerSecond);
      setMined(_mined);
      setRewardPerSecond(_reward);
      setSizeLimit(wei.from(data[0].sizeLimit));
      setSizeLevel(Number(data[0].sizeLevel));
      setSpeedLevel(Number(data[0].speedLevel));
      start = Date.now();
      setTimestamp(Date.now());
      
      clearInterval(interval);
      interval = setInterval(increaseMined, 1000);
    } catch (error) {
      console.error('[useMining]', error);
    }
    setIsClaiming(false);
  }
  
  React.useEffect(() => {
    if (!telegramId || !isConnected || !token) return;
    if (!network.contractAddresses.mining) return;
    loadMiningData();
    
    return () => {
      clearInterval(interval);
    }
  }, [accountAddress, isConnected, token])
  
  const onClaim = async () => {
    setIsClaiming(true);
    haptic.click();
    try {
      let tx;
      if (gasless && useGasless) {
        tx = await apiClaim();
        dispatch(appSetGasless(tx.gasless));
      } else {
        const contract = await getContract(PXLsABI, network.contractAddresses.mining);
        tx = await transaction(contract, 'claimReward', [telegramId]);
      }
      toaster.success('Pixel Shards claimed');
      haptic.success();
      console.log('[onClaim]', tx);
      await loadMiningData();
      haptic.tiny();
    } catch (error) {
      console.error('[onClaim]', error);
      const details = processError(error);
      haptic.error();
      if (details.isGas) {
        toaster.gas(details.gas);
      } else {
        toaster.error(details.message);
      }
    }
    setIsClaiming(false);
  }
  
  const minedValue = mined > sizeLimit
    ? sizeLimit
    : mined;
  const minedPercents = sizeLimit
    ? minedValue / sizeLimit * 100
    : 0;
  const isFull = minedValue === sizeLimit;
  
  return {
    loadMiningData,
    token,
    gasToken,
    claimed,
    mined,
    rewardPerSecond,
    sizeLimit,
    timestamp,
    isClaiming,
    minedValue,
    minedPercents,
    onClaim,
    gasless,
    useGasless,
    toggleUseGasless,
    isFull,
    sizeLevel,
    speedLevel,
  }
}

export default useMining;
