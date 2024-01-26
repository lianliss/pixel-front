'use strict';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BrowserRouter,
  Routes,
  Route,
  useMatch,
} from "react-router-dom";
import Page from 'lib/Page/Page';
import LoadModule from 'utils/async/load-module';
import routes from 'const/routes';

function PageContainer({path, lib, component, title, params = {}}) {
  const match = useMatch(path);
  return <Page {...{match, title}}>
    {!!lib ? <LoadModule lib={lib} {...match.params} {...params} /> : component}
  </Page>
}

function Router() {
  
  const account = useSelector(state => state.App.account);
  
  return <BrowserRouter>
    <Routes>
      {Object.keys(routes).map(name => {
        const {path, lib, component, isAvailable} = routes[name];
        if (typeof isAvailable === 'function' && !isAvailable(account)) return;
        
        return <Route path={path} key={name} element={<PageContainer {...routes[name]} />} />
      })}
    </Routes>
  </BrowserRouter>;
}

export default Router;
