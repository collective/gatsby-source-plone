import { createStore as reduxCreateStore } from 'redux';

const EXPAND_NAVIGATION = 'EXPAND_NAVIGATION';
const COLLAPSE_NAVIGATION = 'COLLAPSE_NAVIGATION';

const reducer = (state, action) => {
  if (action.type === EXPAND_NAVIGATION) {
    return Object.assign({}, state, {
      navigationExpanded: true,
    });
  }
  if (action.type === COLLAPSE_NAVIGATION) {
    return Object.assign({}, state, {
      navigationExpanded: false,
    });
  }
  return state;
};

const initialState = { navigationExpanded: false };

const createStore = () => reduxCreateStore(reducer, initialState);

export default createStore;
export { EXPAND_NAVIGATION, COLLAPSE_NAVIGATION };
