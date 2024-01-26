'use strict';
import React from 'react';

const routes = {
  home: {
    path: '/',
    title: 'Dashboard',
    icon: 'control',
    lib: 'Dashboard',
  },
  dashboard: {
    path: '/dashboard/',
    title: 'Dashboard',
    icon: 'control',
    lib: 'Dashboard',
  },
  bridge: {
    path: '/bridge/',
    title: 'Bridge',
    icon: 'flow-review',
    lib: 'Dashboard',
    disabled: true,
  },
  p2p: {
    path: '/p2p/',
    title: 'P2P',
    icon: 'inherited-group',
    lib: 'Dashboard',
    disabled: true,
  },
  exchange: {
    path: '/exchange/',
    title: 'Exchange',
    icon: 'exchange',
    lib: 'Exchanger',
  },
  exchangeCurrency: {
    path: '/exchange/:from/:to',
    title: 'Exchange',
    icon: 'exchange',
    lib: 'Exchanger',
  },
  liquidity: {
    path: '/exchange/liquidity/',
    title: 'Liquidity',
    icon: 'exchange',
    lib: 'Exchanger',
  },
  farming: {
    path: '/farming/',
    title: 'Farming',
    icon: 'rocket-slant',
    lib: 'Dashboard',
    disabled: true,
  },
  extractor: {
    path: '/extractor/',
    title: 'Pixel Extractor',
    icon: 'lightning',
    lib: 'Dashboard',
    disabled: true,
  },
  wars: {
    path: '/wars/',
    title: 'Pixel Wars',
    icon: 'tank',
    lib: 'Dashboard',
    disabled: true,
  },
  collection: {
    path: '/collection/',
    title: 'Collection',
    icon: 'heat-grid',
    lib: 'Dashboard',
    disabled: true,
  },
  nftMarket: {
    path: '/nft-market/',
    title: 'NFT Market',
    icon: 'shop',
    lib: 'Dashboard',
    disabled: true,
  },
  nftStacking: {
    path: '/nft-stacking/',
    title: 'NFT Stacking',
    icon: 'cube-add',
    lib: 'Dashboard',
    disabled: true,
  },
  borrow: {
    path: '/borrow/',
    title: 'Borrow',
    icon: 'fuel',
    lib: 'Dashboard',
    disabled: true,
  },
  education: {
    path: '/education/',
    title: 'Pixel Education',
    icon: 'learning',
    lib: 'Dashboard',
    disabled: true,
  },
  about: {
    path: '/about/',
    title: 'About',
    icon: 'info-sign',
    lib: 'Dashboard',
    disabled: true,
  },
  history: {
    path: '/history/',
    title: 'History',
    icon: 'pulse',
    lib: 'Dashboard',
    disabled: true,
  },
  settings: {
    path: '/settings/',
    title: 'Settings',
    icon: 'cog',
    lib: 'Dashboard',
    disabled: true,
  },
};

export default routes;

