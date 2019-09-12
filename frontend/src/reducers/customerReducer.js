const initialState = {
  tasks: [],
  results: [],
  sendRating: {
    success: null,
    tokenValid: null
  },
  developers: [],
  devList: [],
  count: null,
  activeCount: null,
  addToFav: null,
  emailList: null,
  mailSuccess: false
};

const customer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_TASKS_ASYNC':
      return { ...state, tasks: action.tasks };
    case 'GET_FEEDBACK_ASYNC':
      return { ...state, results: action.results };
    case 'SEND_RATING_SUCCESS':
      return { ...state, sendRating: {
        success: action.success,
        tokenValid: action.tokenValid
      }};
    case 'SEND_RATING_FAILURE':
      return { ...state, sendRating: {
        success: action.success,
        tokenValid: action.tokenValid
      }};
    case 'GET_DEVS_SUCCESS':
      return { ...state, developers: action.developers };
    case 'GET_DEVS_FAILURE':
      return { ...state, developers: action.developers };
    case 'GET_DEVS_LIST_SUCCESS':
      return { ...state, devList: action.devList };
    case 'GET_DEVS_LIST_FAILURE':
      return { ...state, devList: action.devList };
    case 'COUNT_DEVS_LIST_SUCCESS':
      return { ...state,
        count: action.count,
        activeCount: action.activeCount };
    case 'COUNT_DEVS_LIST_FAILURE':
      return { ...state, count: action.count };
    case 'ADD_TO_FAV_SUCCESS':
      return { ...state, addToFav: action.addToFav };
    case 'GET_MAILING_LIST_SUCCESS':
      return { ...state,
        emailList: action.emailList,
        mailSuccess: action.mailSuccess
      };
    case 'GET_MAILING_LIST_FAILURE':
      return { ...state,
        emailList: action.emailList,
      };   
    default:
      return state;
   }
};
export default customer;