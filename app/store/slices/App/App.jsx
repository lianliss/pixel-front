import {createSlice} from "@reduxjs/toolkit";
import INITIAL_APP_STATE from "const/schemas/app";
import _ from 'lodash-es';

export const AppSlice = createSlice({
  name: 'App',
  initialState: {
    ...INITIAL_APP_STATE
  },
  reducers: {
    appStateInitialize: (state, {payload}) => {
    
    },
    appUpdateAccount: (state, {payload}) => {
      state.account = !!payload ? {...state.account, ...payload} : null;
    },
    appUpdateAuth: (state, {payload}) => {
      state.isAuthorized = payload;
    },
    appSetAdaptive: (state, {payload}) => {
      state.adaptive = payload;
    }
  },
});

export const {
  appStateInitialize,
  appUpdateAccount,
  appUpdateAuth,
  appSetAdaptive,
} = AppSlice.actions;

export default AppSlice.reducer;
