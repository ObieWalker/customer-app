import React, { Component, Fragment } from 'react';

export default class EmailVerificationErrorView extends Component {

  render() {

    return (
      <Fragment>
        <div className="varification-view">
          <p>Ops! something went wrong!</p>
          <p>Please try again.</p>
        </div>
      </Fragment>
    );
  }
}
