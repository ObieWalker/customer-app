import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import LoginView from './routes/login';
import EmailVerificationView from './routes/EmailVerificationView';
import DevSetupView from './routes/dev/setup';
import DevStandupView from './routes/dev/standup';
import DevFAQView from './routes/dev/faq';
import ListDevView from './routes/customer/listDev';
import ListFavouriteDevView from './routes/customer/listFavouriteDev';
import ListMatchedDevView from './routes/customer/listMatchedDev';
import DevStandupDetailView from './routes/customer/devStandupDetail';
import DevHistory from './routes/dev/history';
import HandyAuth from './components/handyAuth/handyAuth';
import AccountSetting from './routes/account/AccountSetting';
import routeNames from './constants/routeNames';
import configureStore from './storage/configureStore';
import SetupCustomer from './routes/pm/SetupCustomer';
import CustomersList from './routes/pm/CustomersList';
import UpdateCustomerMatchedDevs from './routes/pm/UpdateCustomerMatchedDevs';
import ThankyouFeedback from './components/customer/thankyouFeedback';

const { store, persistor } = configureStore();

const Root = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <HandyAuth>
        <Router basename="/postmatch">
          <Route exact path={routeNames.LOGIN} component={LoginView} />
          <Route exact path={routeNames.EMAIL_VERIFICATION} component={EmailVerificationView} />
          <Route exact path={routeNames.DEVELOPER_SETUP} component={DevSetupView} />
          <Route exact path={routeNames.DEVELOPER_STANDUP} component={DevStandupView} />
          <Route exact path={routeNames.DEVELOPER_HISTORY} component={DevHistory} />
          <Route exact path={routeNames.DEVELOPER_FAQ} component={DevFAQView} />
          <Route exact path={routeNames.CUSTOMER_LIST_DEV} component={ListDevView} />
          <Route exact path={routeNames.CUSTOMER_FAV_DEV} component={ListFavouriteDevView} />

          <Route exact path={routeNames.CUSTOMER_MATCHED_DEV} component={ListMatchedDevView} />
          <Route exact path={routeNames.CUSTOMER_VIEW_DEV} component={DevStandupDetailView} />
          <Route exact path={routeNames.ACCOUNT_SETTING} component={AccountSetting} />
          <Route exact path={routeNames.PM} component={ListDevView} />
          <Route exact path={routeNames.PM_CUSTOMER_SETUP} component={SetupCustomer} />
          <Route exact path={routeNames.PM_CUSTOMER_LIST} component={CustomersList} />
          <Route exact path={routeNames.PM_CUSTOMER_UPDATE_MATCHED_DEVS} component={UpdateCustomerMatchedDevs} />
          <Route exact path={routeNames.CUSTOMER_VIEW_THANKYOU_FEEDBACK} component={ThankyouFeedback}/>
        </Router>
      </HandyAuth>
    </PersistGate>
  </Provider>
)

export default Root
