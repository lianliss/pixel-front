'use strict';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import logo from 'styles/svg/logo_small.svg';
import {
  Icon,
} from '@blueprintjs/core';
import _ from 'lodash';
import routes from 'const/routes';
import {
  Link,
} from "react-router-dom";
import UserCard from './UserCard/UserCard';
import {useNavigate} from 'react-router-dom';

const sections = [
  {
    isAvailable: account => true,
    menu: [
      routes.dashboard,
      routes.home,
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
      routes.about,
      routes.history,
      routes.settings,
    ],
  },
];

function DisabledLink(props) {
  return <div className="sidebar-item disabled" {...props} />
}

function Sidebar({match}) {
  const account = {};
  const navigate = useNavigate();
  
  return <div className="sidebar">
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
            const path = _.get(item, 'path');
            const isActive = _.includes(match.pathname, path);
            const isDisabled = !!item.disabled;
            const LinkComponent = isDisabled ? DisabledLink : Link;
            const link = _.get(item, 'link');
            
            if (link) {
              return <a href={link} className="sidebar-item" target="_blank" key={itemIndex}>
                <Icon icon={item.icon} size={24} className="sidebar-item-icon" />
                <span className="sidebar-item-title">{item.title}</span>
              </a>
            }
            
            return <LinkComponent className={`sidebar-item${isActive ? ' active' : ''}${isDisabled ? ' disabled' : ''}`}
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
