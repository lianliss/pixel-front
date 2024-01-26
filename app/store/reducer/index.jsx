import {combineReducers} from "redux";

import App from "slices/App";
import Dapp from "slices/Dapp";

export const reducer = combineReducers({
	App,
	Dapp,
});

export default reducer;
