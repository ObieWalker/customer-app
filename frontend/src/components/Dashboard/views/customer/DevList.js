import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import StandupMissed from '../../../dev/standupMissed';
import DevFeedBackIndicator from '../../../dev/DevFeedBackIndicator';
import routeNames from '../../../../constants/routeNames';
import axios from 'axios';

const DevList = (props) => {

  const [updateListValue, setUpdateList] = useState({ val: 1 });
  const [developers, setDevelopersList] = useState(props.developers);
  useEffect(() => setDevelopersList(props.developers), [props.developers.map(dev => dev.id).join(":")]);
  const updateList = () => setUpdateList({ val: updateListValue.val + 1 });



  // load feedback data
  const loadFeedBackData = dev => {
    return openFeedback => {
      // (show|hide) Feedback box
      dev.showFeedbacks = openFeedback;
      // hide the loading message
      dev.loading = false;
      // if is the first call for feedback data
      if (openFeedback && !dev.feedbackData) {
        // show the loading message
        dev.loading = true;
        // Request feedback data
        axios.post(routeNames.API_CUSTOMER, {
          action: 'get_feedback',
          role_id: props.role_type_id,
          customerId: props.userId,
          standupId: dev.id
        })
          .then(response => {
            // hide the loading message
            dev.loading = false;
            // save data in cuurent dev object
            dev.feedbackData = response.data;
            // render developers list;
            updateList();
          })
          .catch(_err => {
            // reset feedback data
            dev.feedbackData = {};
            // render developers list;
            updateList();
          });
      }
      // render developers list;
      updateList();
    }
  }



  // show Message In Feedback box
  const showMessageInFeedback = message => {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100
      }}>
        {message}
      </div>
    );
  }

  // show Feedbacks List
  const showFeedbacksList = dev => {
    return (dev.feedbackData.result || []).length ? (
      dev.feedbackData.result.map(({ feedback }, feedbackIndex) => (
        <p key={'feedback_' + feedbackIndex}>
          {feedback}
        </p>
      ))
    ) : showMessageInFeedback('No feedback yet')
  }





  return developers.map((dev, index) => {
    return (
      <div className="row col-12" key={"dev_" + index}>
        <div className="col-12 align-items-center rowDev">
          <Link target='_blank' to={props.linkTo.replace(':devId', dev.id)} className='devlink clickable' /*onClick={() => { props.viewDetailDev(dev.id, dev.full_name); }}*/>
            <h5>{dev.full_name}</h5>
            <h6>({dev.email})</h6>
          </Link>
          <StandupMissed devId={dev.id} key={'sm_' + dev.id} />
          <div className={'fav_dev clickable' + (props.noFav === true ? ' hidden' : '')} onClick={() => { props.favouriteDev(dev.id); }}></div>
          {(props.userRole === 2 && dev.feedbackCount > 0) ? (
            <DevFeedBackIndicator onChange={loadFeedBackData(dev)} />
          ) : null}
        </div>
        {dev.showFeedbacks ? (
          <div className="feedbacks-section col-12" >
            <div>{dev.loading ? showMessageInFeedback('Loading feedbacks ...') : (dev.feedbackData.success ? showFeedbacksList(dev) : showMessageInFeedback('An error has occurred!'))}</div>
          </div>
        ) : null}
      </div>
    )
  })
}


const mapStateToProps = appState => ({
  full_name: appState.userRoot.user.full_name,
  userId: appState.userRoot.user.id,
  role_type_id: appState.userRoot.user.role_type_id
});

export default withRouter(connect(mapStateToProps)(DevList));


