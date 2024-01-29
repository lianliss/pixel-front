'use strict';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import logo from 'styles/svg/logo_small.svg';
import {useNavigate} from 'react-router-dom';
import {
  FormGroup,
  ControlGroup,
  InputGroup,
  Button as BluePrintButton,
  Icon,
  Spinner,
  Popover,
  Menu,
  MenuItem,
} from '@blueprintjs/core';
import {Button} from 'ui';
import pixelLogo from 'styles/svg/logo_icon.svg';
import _ from 'lodash';
import {appUpdateAccount} from 'slices/App';
import routes from 'const/routes';
import getFinePrice from 'utils/getFinePrice';
import {BUILT_AT} from 'const';
import {Web3Context} from 'services/web3Provider';
import {ModalContext} from "services/ModalProvider";

function Header() {
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const context = React.useContext(Web3Context);
  const {
    connectToWalletModal,
  } = React.useContext(ModalContext);
  const [isConnecting, setIsConnecting] = React.useState(false);
  
  const {
    accountAddress,
    connectWallet,
  } = context;
  
  const onLogoClick = () => {
    navigate(routes.dashboard.path);
  };
  
  const onWalletConnect = () => {
    connectToWalletModal();
    // setIsConnecting(true);
    //
    // connectWallet().then(data => {
    //   setIsConnecting(false);
    // }).catch(error => {
    //   setIsConnecting(false);
    // });
  };
  
  const connectText = accountAddress
    ? accountAddress.slice(0, 6) + '...' + accountAddress.slice(accountAddress.length - 6)
    : 'Connect Wallet';
  
  const userMenu = <Menu>
    <MenuItem text="Support" disabled icon="chat" />
  </Menu>;
  
  return <div className="header">
    <BluePrintButton icon={<Icon icon="menu" size={20} />} className={"header-round header-menu-icon"} minimal />
    <div className={"header-right"}>
      <BluePrintButton icon={<Icon icon="search" size={20} />} className={"header-round"} minimal />
      <BluePrintButton icon={<Icon icon="layout-grid" size={20} />} className={"header-round"} minimal />
      <Button icon={<img src={pixelLogo} />} minimal >
        $0.04
      </Button>
      <Button icon={"box"} minimal >
        Airdrop
      </Button>
      <Button icon={"antenna"} onClick={onWalletConnect} primary={!accountAddress} minimal >
        {connectText}
      </Button>
    </div>
  </div>
}

export default Header;