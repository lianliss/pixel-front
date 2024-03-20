'use strict';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from 'lib/Page/Header/Header';
import Sidebar from 'lib/Page/Sidebar/Sidebar';
import {adaptiveSelector, isHideMenuButtonSelector} from 'app/store/selectors';
import {classNames as cn} from 'utils';
import {
  Button as BluePrintButton, Icon,
} from '@blueprintjs/core';
import {IS_TELEGRAM} from "const";
import {Web3Context} from "services/web3Provider";
import {TelegramContext} from "services/telegramProvider";

function Page({children, match, title}) {
  const {isConnected} = React.useContext(Web3Context);
  const {
    backActionsLength,
    backActionClick,
    haptic,
  } = React.useContext(TelegramContext);
  const adaptive = useSelector(adaptiveSelector);
  const isHideMenuButton = useSelector(isHideMenuButtonSelector);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const onMenuClick = () => {
    isMenuOpen ? haptic.rigid() : haptic.click();
    setIsMenuOpen(!isMenuOpen);
  }
  
  const onBackClick = () => {
    backActionClick();
  }
  
  return <div className={cn('page-container', adaptive && 'adaptive')}>
    <Sidebar match={match}
             setIsMenuOpen={setIsMenuOpen}
             isMenuOpen={isMenuOpen} />
    <div className="page">
      {!IS_TELEGRAM && <Header setIsMenuOpen={setIsMenuOpen} isMenuOpen={isMenuOpen} />}
      {(IS_TELEGRAM && isConnected && !isHideMenuButton) && <BluePrintButton icon={<Icon icon={isMenuOpen ? 'cross' : 'menu'} size={20} />}
                                    onClick={onMenuClick}
                                    className={"page-menu-button"}
                                    minimal />}
      {/*{(IS_TELEGRAM && !!backActionsLength) && <BluePrintButton icon={<Icon icon={'chevron-left'} size={20} />}*/}
      {/*                                                  onClick={onBackClick}*/}
      {/*                                                  className={"page-back-button"}*/}
      {/*                                                  minimal />}*/}
      <div className={cn("page-content", (adaptive && isMenuOpen) && 'menu-open')}>
        {children || <>Empty page</>}
      </div>
      {(adaptive && isMenuOpen) && <div className="page-overlay"
                                        onClick={() => setIsMenuOpen(false)} />}
    </div>
  </div>
}

export default Page;
