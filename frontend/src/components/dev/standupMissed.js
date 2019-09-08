import React, { Component } from 'react';
import axios from 'axios';
import routeNames from '../../constants/routeNames';
import IconHelp from './IconHelp';

export default class StandupMissed extends Component {

  constructor(_props) {
    super(_props);
    this.state = {
      totalDays: 0,
      doneStandups: 0,
      standup_missed: 0,
      loaded: false,
      showinfo: false
    }
    this.timer = null;
  }

  componentDidMount() {
    var body = {
      action: 'standup_missed',
      devId: this.props.devId
    }

    var self = this;
    axios.post(routeNames.API_CUSTOMER, body)
      .then(function (response) {
        var data = response.data;
        if (data.success) {
          var done = data.result[0].doneStandups;
          var total = data.result[0].totalDays;
          if (!total) total = 0;
          var missed = total - done;
          self.setState({ doneStandups: done, totalDays: total, standup_missed: missed, loaded: true });
        }
      })
      .catch(function (_err) {

      });
  }
  showinfobox() {
    if (this.timer) clearTimeout(this.timer);
    this.setState({ showinfo: true });
    this.timer = setTimeout(() => this.setState({ showinfo: false }), 5000);
  }
  hideinfobox() {
    if (this.timer) clearTimeout(this.timer);
    this.setState({ showinfo: false });
  }
  toggleInfobox() {
    if (this.state.showinfo) {
      this.hideinfobox();
    } else {
      this.showinfobox();
    }
  }

  render() {

    var displayText = '';
    if (this.state.loaded) {
      displayText = `${this.state.doneStandups}/${this.state.totalDays}`;
      if (this.state.doneStandups === this.state.totalDays && this.state.totalDays === 0) displayText = 'New'; /* NO DATA, NULL ... BECAUSE OUR DATA IS NOT CONSISTENT */
      if (this.state.doneStandups === 0 && this.state.totalDays === 1) displayText = 'New'; /* SAME DAY SETUP, NOT TIME TO STANDUP YET */
    }
    var missed = this.state.totalDays - this.state.doneStandups;
    var totalDays = this.state.totalDays;
    return (
      <>
        <div
          className={'position-relative ' + this.props.className + ' standupMissedIndicator' + (this.state.standup_missed > 3 ? ' redAlert' : (this.state.standup_missed > 1 ? ' yellowAlert' : (displayText === 'New' ? ' newAlert' : ' greenAlert')))}
          onClick={e => this.toggleInfobox()}
        >
          {displayText}
          <IconHelp />
          {this.state.showinfo ? (
            <div className="infobulle">
              {totalDays === 0 ? (
                "This dev is just registered to Daily Standup System"
              ) : (
                  missed === 0 ? (
                    "This dev didn't miss any standup on total " + totalDays + " day" + (totalDays > 1 ? "s" : "") + "."
                  ) : (
                      missed === totalDays ? (
                        "This dev miss all of the total " + totalDays + " standups."
                      ) : (
                          "This dev done " + this.state.doneStandups + " standups and " + " missed " + missed + " on total " + totalDays + " day" + (totalDays > 1 ? "s" : "") + "."
                        )
                    )
                )}
            </div>
          ) : null}
        </div>
      </>
    )
  }
}
