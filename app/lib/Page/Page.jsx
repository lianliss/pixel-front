'use strict';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from 'lib/Page/Header/Header';
import Sidebar from 'lib/Page/Sidebar/Sidebar';

function Page({children, match, title}) {
  return <div className="page-container">
    <Sidebar match={match} />
    <div className="page">
      <Header />
      <div className="page-content">
        {children || <>Empty page</>}
      </div>
    </div>
  </div>
}

export default Page;
