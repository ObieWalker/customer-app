const userActions = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_GOOGLE: 'loginGoogle',
  LOGIN_FACEBOOK: 'loginFacebook',
  SIGN_UP: 'signup',
  SIGN_UP_SOCIAL: 'signup_social',
  GET_USER_INFO: 'getUserInfo',
  USER_UPDATE: "user_update"
}

const devActions = {
  SETUP_STANDUP_TIME: 'setup',
  LIST_STANDUP_TIME: 'listSetup',
  CHECK_VALID_STANDUP_TIME: 'checkValidStandup',
  GET_STANDUP_PLAN_TASKS: 'getStandupPlanTasks',
  GET_FEEDBACK_BY_STANDUP: 'getFeedbackByStandup',
  SAVE_STANDUP: 'standup',
  OPT_OUT: 'optout',
  /* CUSTOMER CAN USE */
  GET_STANDUP_PLAN_TASKS_BY_STANDUP_ID: "getStandupPlanTasks_byId",
  /* CUSTOMER CAN USE */
  GET_STANDUP_ANSWERS: "getStandupAnswers",
  /* CUSTOMER CAN USE */
  GET_STANDUPS: "getStandups",
  /* CUSTOMER CAN USE */
  GET_CHALLENGES: "getChallenges", /* CUSTOMER CAN USE */
  USER_UPDATE: "user_update",
  GET_MAILING_LIST_BY_DEV: 'getMailingListByDev'
};

const customerActions = {
  LIST_DEVS: 'list',
  COUNT_LIST_DEVS: 'count_list',
  COUNT_LIST_DEVS_BOTH: 'inital_counts',
  FAVORITE_DEV: 'fav_dev',
  LIST_FAV_DEVS: 'list_favDevs',
  VIEW_DEV: 'view_dev',
  SEND_FEEDBACK: 'feedback',
  SEND_FEEDBACK_RATE: 'rate',
  GET_FEEDBACK_RATE: 'get_feedback_rate',
  GET_FEEDBACK: 'get_feedback',
  GET_STANDUP_MISSED: 'standup_missed', /* SEPARATE RETRIEVE BECAUSE OF THE DB IS BIG */
  GET_STANDUP_TASKS_STAT_IN_RANGE: 'getStandupTasksStatInRange',
  GET_STANDUPS_BY_OPTOUT_PERIOD: 'getStandupsByOptOutPeriod',
  GET_DEV_STANDUP_PERIODS: 'getDevStandupPeriods',
  GET_MAILING_LIST: 'getMailingList',
  UPDATE_MAILING_LIST: 'updateMailingList',
  ADD_SHAREABLE_LINK: 'addShareableLink'
}

const pmActions = {
  LIST_DEVS: "list",
  FAVORITE_DEV: "fav_dev",
  VIEW_DEV: "view_dev",
  NEW_CUSTOMER: "newCustomer",
  UPDATE_MATCHED_LIST: "updateMatchedList",
  GET_MATCHED_LIST: "getMatchedList",
  CUSTOMERS_LIST: "CustomersList",
  DEVELOPERS_LIST: "DevelopersList",
  RESEND_INVITATION: "resendInvitation"
};

const commonActions = {
  LIST_TIMEZONES: "listTimezones",
  API_GENERATE_SHAREABLE_LINK: 'api_shareableLink'
};



module.exports = {
  userActions: userActions,
  devActions: devActions,
  customerActions: customerActions,
  pmActions: pmActions,
  commonActions: commonActions
};
