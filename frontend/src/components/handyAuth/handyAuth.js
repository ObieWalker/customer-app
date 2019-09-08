import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

class HandyAuth extends Component {

  addToken() {
    if(this.props.token) {
      var token = 'JWT ' + this.props.token;
      axios.defaults.headers.common['Authorization'] = token;
    }
    else {
      var url = new URL(window.location.href);
      var feedbacktokencode = url.searchParams.get('feedbacktoken');
      var sharecode = url.searchParams.get('sharecode');
      if(sharecode) {
        sharecode = 'JWT ' + sharecode;
        axios.defaults.headers.common['Authorization'] = sharecode;
      }else if(feedbacktokencode){
        feedbacktokencode = 'JWT ' + feedbacktokencode;
        axios.defaults.headers.common['Authorization'] = feedbacktokencode;
       }
      else {
        axios.defaults.headers.common['Authorization'] = null;
      }
    }
  }

  render() {
    this.addToken();
    /* USE THE STYLE OF THE root */
    return (
      <div id='root'>
        {this.props.children}
      </div>
    );
  }
}

const mapStateToProps = appState => ({
  token: appState.userRoot.user.token
});

export default connect(mapStateToProps)(HandyAuth);
