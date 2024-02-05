'use strict';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from 'lib/Page/Header/Header';
import Sidebar from 'lib/Page/Sidebar/Sidebar';
import {adaptiveSelector} from 'app/store/selectors';
import {classNames as cn} from 'utils';

function Page({children, match, title}) {
  const adaptive = useSelector(adaptiveSelector);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  return <div className={cn('page-container', adaptive && 'adaptive')}>
    <Sidebar match={match} isMenuOpen={isMenuOpen} />
    <div className="page">
      <Header setIsMenuOpen={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <div className={cn("page-content", (adaptive && isMenuOpen) && 'menu-open')}>
        {children || <>Empty page</>}
      </div>
    </div>
  </div>
}

export default Page;
