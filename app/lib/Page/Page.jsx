'use strict';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from 'lib/Page/Header/Header';
import Sidebar from 'lib/Page/Sidebar/Sidebar';
import {adaptiveSelector} from 'app/store/selectors';
import {classNames as cn} from 'utils';
import {
  Button as BluePrintButton, Icon,
} from '@blueprintjs/core';
import {IS_TELEGRAM} from "const";

function Page({children, match, title}) {
  const adaptive = useSelector(adaptiveSelector);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  return <div className={cn('page-container', adaptive && 'adaptive')}>
    <Sidebar match={match} isMenuOpen={isMenuOpen} />
    <div className="page">
      {!IS_TELEGRAM && <Header setIsMenuOpen={setIsMenuOpen} isMenuOpen={isMenuOpen} />}
      {IS_TELEGRAM && <BluePrintButton icon={<Icon icon={isMenuOpen ? 'cross' : 'menu'} size={20} />}
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className={"page-menu-button"}
                                    minimal />}
      <div className={cn("page-content", (adaptive && isMenuOpen) && 'menu-open')}>
        {children || <>Empty page</>}
      </div>
      {(adaptive && isMenuOpen) && <div className="page-overlay"
                                        onClick={() => setIsMenuOpen(false)} />}
    </div>
  </div>
}

export default Page;
