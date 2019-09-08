import { createStore/*, applyMiddleware*/ } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
/*import logger from 'redux-logger';*/

import devStanupApp from '../reducers/reducers';

const persistConfig = {
  key: 'rootStorage',
  storage: storage
}

const persistedReducer = persistReducer(persistConfig, devStanupApp);

const configureStore = () => {
  var store = createStore(persistedReducer/*, applyMiddleware(logger)*/);
  var persistor = persistStore(store);
  return { store, persistor }
};

export default configureStore;
