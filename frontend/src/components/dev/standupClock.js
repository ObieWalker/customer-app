import React, { Component } from 'react';

export default class StandupClock extends Component {

  constructor(_props) {
    super(_props);
    this.state = {
      timeLeft: 0
    }

    this.clockRef = React.createRef();

    this.timerTick = this.timerTick.bind(this);
  }

  componentDidMount() {

    if(this.props.timeLeft > 0) {
      this.setState( { timeLeft: this.props.timeLeft } )
      this.timer = setInterval(this.timerTick, 1000);
    }
  }

  timerTick() {
    this.setState( { timeLeft: this.state.timeLeft - 1 });
    if(this.state.timeLeft <= 0) {
      clearInterval(this.timer);
      if(this.props.outOfTime) this.props.outOfTime();
      return;
    }

    if(!this.clockRef.current) {
      clearInterval(this.timer);
    }
  }

  render() {

    var mins = Math.floor(this.state.timeLeft / 60);
    var secs = this.state.timeLeft - mins * 60;
    var timeToDisplay = ('0' + mins).slice(-2) + ':' + ('0' + secs).slice(-2);

    return <div ref={this.clockRef} className={'standupClock' + (this.state.timeLeft <= 3*60 ? ' text-danger':'')}><h2>{timeToDisplay}</h2></div>
  }
}
