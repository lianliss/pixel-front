import {createSlice} from "@reduxjs/toolkit";
import INITIAL_DAPP_STATE from "const/schemas/dapp";

export const DappSlice = createSlice({
  name: 'Dapp',
  initialState: {
    ...INITIAL_DAPP_STATE
  },
  reducers: {
    setExchangeAmount: {
      prepare: (amount, focus) => ({payload: {amount, focus}}),
      reducer: (state, {payload: {amount, focus}}) => {
        if (!state.exchange[focus]) {
          state.exchange[focus] = {};
        }
        state.exchange[focus].amount = amount;
      }
    },
    setExchangeToken: {
      prepare: (token, focus) => ({payload: {token, focus}}),
      reducer: (state, {payload: {token, focus}}) => {
        if (!state.exchange[focus]) {
          state.exchange[focus] = {};
        }
        state.exchange[focus].token = token;
      }
    },
    setExchangeFocus: {
      reducer: (state, {payload}) => {
        state.exchange.focus = payload;
      }
    }
  },
});

export const {
  setExchangeAmount,
  setExchangeToken,
  setExchangeFocus,
} = DappSlice.actions;

export default DappSlice.reducer;
