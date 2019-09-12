import { createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import createSagaMiddleware from 'redux-saga'
import storage from 'redux-persist/lib/storage';
import rootSaga from '../saga'
// import {watchGetTasksAsync} from '../saga'
/*import logger from 'redux-logger';*/

import devStanupApp from '../reducers/reducers';

const persistConfig = {
  key: 'rootStorage',
  storage: storage
}

const sagaMiddleware = createSagaMiddleware()
const persistedReducer = persistReducer(persistConfig, devStanupApp);

const configureStore = () => {
  var store = createStore(persistedReducer, applyMiddleware(sagaMiddleware));
  var persistor = persistStore(store);
  sagaMiddleware.run(rootSaga)
  return { store, persistor }
};

export default configureStore;
