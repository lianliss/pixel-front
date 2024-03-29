'use strict';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import logo from 'styles/svg/logo_small.svg';
import {
  Icon,
} from '@blueprintjs/core';
import get from 'lodash/get';
import includes from 'lodash/includes';
import routes from 'const/routes';
import {
  Link,
} from "react-router-dom";
import UserCard from './UserCard/UserCard';
import {useNavigate} from 'react-router-dom';
import {adaptiveSelector} from 'app/store/selectors';
import {classNames as cn} from 'utils';
import {Web3Context} from "services/web3Provider";
import {ModalContext} from "services/ModalProvider";
import {IS_TELEGRAM} from "const";
import {TelegramContext} from "services/telegramProvider";
import flatten from "lodash-es/flatten";

const sections = [
  {
    isAvailable: account => IS_TELEGRAM,
    menu: [
      routes.wallet,
      routes.walletSettings,
    ],
  },
  {
    isAvailable: account => true,
    menu: [
      routes.dashboard,
      routes.exchange,
      routes.bridge,
      routes.p2p,
      {
        title: 'Multipool',
        link: 'https://multipool.hellopixel.network',
        icon: 'rocket-slant',
      },
      //routes.farming,
      routes.borrow,
    ],
  },
  {
    isAvailable: account => true,
    menu: [
      routes.airdrop,
      routes.collection,
      routes.nftMarket,
      routes.nftStacking,
      routes.extractor,
      routes.wars,
      routes.education,
    ],
  },
  {
    isAvailable: account => true,
    menu: [
      {
        title: 'Docs',
        link: 'https://docs.hellopixel.network/hello-pixel/pixel-introduce',
        icon: 'git-repo',
      },
      routes.history,
      routes.preseed,
      {
        title: 'Logout',
        icon: 'log-out',
        isAvailable: account => !IS_TELEGRAM && !!account.isConnected,
        onClick: account => {
          account.logout();
          return false;
        }
      },
      {
        title: 'Connect Wallet',
        icon: 'antenna',
        isAvailable: account => !IS_TELEGRAM && !account.isConnected,
        onClick: account => {
          account.connectToWalletModal();
          return false;
        }
      },
    ],
  },
];

const getAvailableMenus = account => flatten(sections.map(section => {
  if (section.isAvailable(account)) {
    return section.menu;
  } else {
    return [];
  }
}));

function DisabledLink(props) {
  return <div className="sidebar-item disabled" {...props} />
}

function Sidebar({match, isMenuOpen, setIsMenuOpen}) {
  const context = React.useContext(Web3Context);
  const modal = React.useContext(ModalContext);
  const {haptic} = React.useContext(TelegramContext);
  const {accountAddress, isConnected, logout} = context;
  const {connectToWalletModal} = modal;
  const account = {
    isConnected,
    accountAddress,
    logout,
    connectToWalletModal,
  };
  const navigate = useNavigate();
  const adaptive = useSelector(adaptiveSelector);
  
  const menus = getAvailableMenus(account);
  const currentPath = get(match, 'pattern.path');
  const activeMenu = menus.find(menu => menu.path === currentPath);
  const matchMenus = currentPath
    ? menus.filter(menu => includes(currentPath, menu.path))
    : [];
  const lastMatchingMenu = matchMenus[matchMenus.length - 1] || {};
  
  const getIsActive = (path) => {
    return activeMenu
      ? path === activeMenu.path
      : path === lastMatchingMenu.path;
  }
  
  return <div className={cn('sidebar', adaptive && 'adaptive', isMenuOpen && 'is-open')}>
    <img className="sidebar-logo" onClick={() => {
      navigate(routes.dashboard.path);
    }} src={logo} />
    <UserCard />
    {sections.map((section, sectionIndex) => {
      if (!section.isAvailable(account)) return;
      return <div className="sidebar-section" key={sectionIndex}>
        {!!section.title && <div className="sidebar-section-title">
          {section.title}
        </div>}
        <div className="sidebar-section-menu">
          {section.menu.map((item, itemIndex) => {
            if (typeof item.isAvailable === 'function' && !item.isAvailable(account)) return;
            const path = get(item, 'path');
            const isActive = getIsActive(path);
            const isDisabled = typeof item.disabled === 'function'
              ? item.disabled(account)
              : !!item.disabled;
            const onClick = typeof item.onClick === 'function'
              ? e => {
                e.preventDefault();
                setIsMenuOpen(false);
                haptic.medium();
                return item.onClick(account);
              }
              : () => {
                haptic.medium();
                setIsMenuOpen(false);
              };
            const LinkComponent = isDisabled ? DisabledLink : Link;
            const link = get(item, 'link');
            
            if (link) {
              return <a href={link}
                        onClick={onClick}
                        className="sidebar-item"
                        target="_blank"
                        key={itemIndex}>
                <Icon icon={item.icon} size={24} className="sidebar-item-icon" />
                <span className="sidebar-item-title">{item.title}</span>
              </a>
            }
            
            return <LinkComponent className={`sidebar-item${isActive ? ' active' : ''}${isDisabled ? ' disabled' : ''}`}
                                  onClick={onClick}
                                  to={item.path}
                                  key={itemIndex}>
              <Icon icon={item.icon} size={24} className="sidebar-item-icon" />
              <span className="sidebar-item-title">{item.title}</span>
            </LinkComponent>;
          })}
        </div>
      </div>
    })}
  </div>
}

export default Sidebar;
