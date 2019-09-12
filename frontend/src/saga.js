import axios from 'axios';
import { takeLatest, put, call, all, fork } from 'redux-saga/effects'
import routeNames from "./constants/routeNames";

function* getTasksAsync(body) {
  try {
    const { data } = yield call(axios.post, routeNames.API_CUSTOMER, body.data);
    yield put({ type: "GET_ALL_TASKS_ASYNC", tasks: data.result });
  } catch(e) {
    console.log(e)
  }
}

function* getFeedbackAsync(body) {
  try {
    const { data } = yield call(axios.post, routeNames.API_CUSTOMER, body.data);
    yield put({ type: "GET_FEEDBACK_ASYNC", result: data.result });
  } catch(e) {
    console.log(e)
  }
}

function* sendRatingAsync(body) {
  try {
    const { data } = yield call(axios.post, routeNames.API_CUSTOMER, body.data);
    yield put({ type: "SEND_RATING_SUCCESS", success: Boolean(data.success) });
  } catch(e) {
    yield put({ type: "SEND_RATING_FAILURE", tokenValid: false});
  }
}

function* getDevsAsync(body) {
  try {
    const { data } = yield call(axios.post, routeNames.API_CUSTOMER, body.data);
    yield put({ type: "GET_DEVS_SUCCESS", developers: data.result });
  } catch(e) {
    yield put({ type: "GET_DEVS_FAILURE", developers: false});
  }
}

function* getDevsListAsync(body) {
  try {
    const { data } = yield call(axios.post, routeNames.API_CUSTOMER, body.data);
    yield put({ type: "GET_DEVS_LIST_SUCCESS", devList: data.result });
  } catch(e) {
    yield put({ type: "GET_DEVS_LIST_FAILURE", devList: false});
  }
}

function* countDevsListAsync(body) {
  try {
    const { data } = yield call(axios.post, routeNames.API_CUSTOMER, body.data);
    yield put({ type: "COUNT_DEVS_LIST_SUCCESS", count: data.result[0], activeCount: data.result[1] });
  } catch(e) {
    yield put({ type: "COUNT_DEVS_LIST_FAILURE", count: 0 });
  }
}

function* addToFavAsync(body) {
  try {
    const { data } = yield call(axios.post, routeNames.API_CUSTOMER, body.data);
    yield put({ type: "ADD_TO_FAV_SUCCESS", addToFav: data.success});
  } catch(e) {
    console.log(e)
  }
}

function* getMailingListAsync(body) {
  try {
    const { data } = yield call(axios.post, routeNames.API_CUSTOMER, body.data);
    yield put({ type: "GET_MAILING_LIST_SUCCESS", emailList: data.result, mailSuccess: data.success});
  } catch(e) {
    yield put({ type: "GET_MAILING_LIST_FAILURE", emailList: e});
  }
}

function* watchGetTasks() {
  yield takeLatest('GET_ALL_TASKS', getTasksAsync)
}

function* watchGetFeedbackByStandups() {
  yield takeLatest('GET_FEEDBACK_BY_STANDUPS', getFeedbackAsync)
}

function* watchSendRating() {
  yield takeLatest('SEND_RATING', sendRatingAsync)
}

function* watchGetFavDevs() {
  yield takeLatest('GET_FAV_DEVS', getDevsAsync)
}

function* watchGetDeveloperList() {
  yield takeLatest('GET_DEV_LIST', getDevsListAsync)
}

function* watchCountDeveloperList() {
  yield takeLatest('COUNT_DEV_LIST', countDevsListAsync)
}

function* watchAddToFav() {
  yield takeLatest('ADD_TO_FAV', addToFavAsync)
}

function* watchGetMailingList() {
  yield takeLatest('GET_MAILING_LIST', getMailingListAsync)
}

export default function* rootSaga() {
  yield all([
    fork(watchGetTasks),
    fork(watchGetFeedbackByStandups),
    fork(watchSendRating),
    fork(watchGetFavDevs),
    fork(watchGetDeveloperList),
    fork(watchCountDeveloperList),
    fork(watchAddToFav),
    fork(watchGetMailingList)

  ])
}
