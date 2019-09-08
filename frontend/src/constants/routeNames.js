const routeNames = {
  LOGIN: '/',
  DEVELOPER_SETUP: '/developer/setup',
  DEVELOPER_STANDUP: '/developer/standup',
  DEVELOPER_FAQ: '/developer/faq',
  DEVELOPER_HISTORY: '/developer/history',
  CUSTOMER_LIST_DEV: '/customer/devs',
  CUSTOMER_FAV_DEV: '/customer/favourites',
  CUSTOMER_MATCHED_DEV: '/customer/matches',
  CUSTOMER_VIEW_DEV: '/customer/view/:devId',
  CUSTOMER_VIEW_THANKYOU_FEEDBACK: '/customer/submit/feedback',
  EMAIL_VERIFICATION: '/verification',
  ACCOUNT_SETTING: '/account/setting',
  PM: '/pm',
  PM_CUSTOMER_SETUP: '/pm/customer/setup',
  PM_CUSTOMER_UPDATE_MATCHED_DEVS: '/pm/customer/matched-devs/:customerId',
  PM_CUSTOMER_LIST: '/pm/customer/list',
  API_ACCOUNT: '/pmApi/account',
  API_USER: '/pmApi/user',
  API_DEV: '/pmApi/dev',
  API_CUSTOMER: '/pmApi/customer',
  API_PM: '/pmApi/pm',
  API_COMMON: '/pmApi/common',
  API_EMAIL_VERIFICATION: '/pmApi/verification-email',
  API_THANK_YOU_FEEDBACK: '/customer/thankyou'
}

module.exports = routeNames;
/* pmApi = Post Match API */
