import React, { Component } from 'react';
import LeftMenu from '../../components/common/LeftMenu';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import FormControl from 'react-bootstrap/FormControl';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';
import routeNames from '../../constants/routeNames';
import StandupClock from '../../components/dev/standupClock';

import './standup.css';

import {
  userLoggedOutAction
} from '../../reducers/userActions';

const standupTimeWindowState = {
  EARLY: 1,
  ONTIME: 2,
  LATE: 3,
  NOT_READY: 4
}

class DevStandupView extends Component {

  constructor(_props) {
    super(_props);

    this.state = {
      error: false,
      showAlert: false,
      alertMessage: '',
      valid: false,
      timeLeft: 0,
      standupTimeZone: null,
      earlyOrLate: null,
      standupWindowState: standupTimeWindowState.NOT_READY,
      standupTime: null,
      serverToSameZoneTime: null,
      serverTime: null,
      submitted: false,
      clock_key: 1,
      tasks: [],
      lastTasks: [],
      questions: [ '', '' , ''],
      renderIndex:0
    };

    this.questionChange = this.questionChange.bind(this);
    this.taskNameChange = this.taskNameChange.bind(this);
    this.taskEstimateChange = this.taskEstimateChange.bind(this);
    this.addTasks = this.addTasks.bind(this);
    this.checkValidStandup = this.checkValidStandup.bind(this);
    this.listLastTasks = this.listLastTasks.bind(this);
    this.lastTaskEstimateChange = this.lastTaskEstimateChange.bind(this);
    this.submit = this.submit.bind(this);
    this.invalidateAfterSubmit = this.invalidateAfterSubmit.bind(this);
    this.outOfTime = this.outOfTime.bind(this);
    this.checkChanged = this.checkChanged.bind(this);
    this.updateNewTasks = this.updateNewTasks.bind(this);
  }

  componentDidMount() {
    /* CHECK ROLE */
    if(this.props.role_type_id !== 3) {
      /* LOG OUT AND FORCE TO LOGIN PAGE */
      var action = userLoggedOutAction();
      this.props.dispatch(action);
      this.props.history.push(routeNames.LOGIN);
      return;
    }

    /* LET'S CHECK IF ITS THE TIME FOR STANDUP */
    this.checkValidStandup();
  }

  checkValidStandup() {
    var body = {
      action: 'checkValidStandup',
      userId: this.props.userId
    }

    var self = this;
    axios.post(routeNames.API_DEV, body)
    .then(function(response) {
      var data = response.data;

      if(data.success)
      {
        var result = data.result[0];
        var valid = result.valid;
        var timeLeft = result.timeLeft;
        var standupTimeZone =  result.standupTimeZone;
        var standupWindowState = standupTimeWindowState.NOT_READY;
        var earlyOrLate = result.earlyOrLate;

        if(earlyOrLate) {
          var isEarly = false;
          if(earlyOrLate.startsWith('-')) isEarly = true;
          var tempEarlyOrLate = earlyOrLate.replace('-','');

          var tempDate = new Date();
          var comps = tempEarlyOrLate.split(':');
          tempDate.setHours(comps[0], comps[1], comps[2]);

          if(tempDate.getHours() === 0) {
            if(tempDate.getMinutes() <= 5) standupWindowState = standupTimeWindowState.ONTIME;
            else {
              if(isEarly) standupWindowState = standupTimeWindowState.EARLY;
              else standupWindowState = standupTimeWindowState.LATE;
            }
          }
          else {
            if(isEarly) standupWindowState = standupTimeWindowState.EARLY;
            else standupWindowState = standupTimeWindowState.LATE;
          }
        }
        var standupTime = result.standupTime;
        var serverToSameZoneTime = result.serverToSameZoneTime;
        var serverTime = result.serverTime;
        var submitted = result.submitted;

        self.setState( { valid: valid, timeLeft: timeLeft, standupTimeZone: standupTimeZone, earlyOrLate: earlyOrLate,
          standupWindowState: standupWindowState, standupTime: standupTime, serverToSameZoneTime: serverToSameZoneTime, serverTime: serverTime, submitted: submitted,
          tasks: [ {name:'',estimate:'', initialTask:-1}, {name:'',estimate:'', initialTask:-1}, {name:'',estimate:'', initialTask:-1} ] , clock_key: self.state.clock_key + 1 });
        //self.setState( { valid: true, timeLeft: 100, clock_key: self.state.clock_key + 1 });
        if(valid) self.listLastTasks();
      }
    })
    .catch(function(_err){
      if(_err && _err.response && _err.response.status === 401) {
        var action = userLoggedOutAction();
        self.props.dispatch(action);
        self.props.history.push(routeNames.LOGIN);
        return;
      }
    });
  }

  listLastTasks() {

    var body = {
      action: 'getStandupPlanTasks', /* SHOULD CHANGE THE StoredProcedure NAME TO SOMETHING BETTER, I.E: getLastStandupPlanTasks */
      userId: this.props.userId
    }

    var self = this;
    axios.post(routeNames.API_DEV, body)
    .then(function(response) {
      var data = response.data;
      if(data.success)
      {
        if(data.result.length > 0) {
          /* GOT LAST TASKS */
          self.setState( { lastTasks: data.result }, function() {
            /* IF TASK NOT COMPLTED, ADD IT TO NEW TASK LIST AND DISABLE REMOVE, ONLY ALLOW ESTIMATE */
            self.updateNewTasks();
          } );
        }
      }
    })
    .catch(function(_err){

    });
  }


  questionChange(e, index) {
    var value = e.target.value;
    var questions = this.state.questions;
    questions[index] = value.replace(/,/g,'&#44;').replace(/[^\x0D\x0A\x20-\x7E]/g,'');

    this.setState( { questions: questions } );
  }

  taskNameChange(e, index) {
    var value = e.target.value;

    var tasks = this.state.tasks;
    tasks[index].name = value;
    this.setState( { tasks: tasks });
  }

  taskEstimateChange(e, index) {
    var value = e.target.value;

    if(isNaN(value) || value < 1 || value > 8) {
      var taskObject = this.state.tasks[index];
      e.target.value = taskObject.estimate;
      return;
    }

    var tasks = this.state.tasks;
    tasks[index].estimate = value;
    this.setState( { tasks: tasks });
  }

  addTasks() {
    var tasks = this.state.tasks;
    tasks.push( { name:'', estimate:'', initialTask: -1 } );
    this.setState( { tasks: tasks });
  }

  lastTaskEstimateChange(e, index) {
    var value = e.target.value;
    var lastTasks = this.state.lastTasks;
    lastTasks[index].changes = value;
    this.setState( { lastTasks: lastTasks } );
  }

  checkChanged(e, index) {
    var lastTasks = this.state.lastTasks;
    if(lastTasks.length > index) {
      lastTasks[index].completed = !lastTasks[index].completed;
    }

    var self = this;
    this.setState( { lastTasks: lastTasks }, function() {
      /* IF TASK NOT COMPLTED, ADD IT TO NEW TASK LIST AND DISABLE REMOVE, ONLY ALLOW ESTIMATE */
      self.updateNewTasks();
    } );
  }

  updateNewTasks() {
    var lastTasks = this.state.lastTasks;
    var tasks = this.state.tasks;
    var anyChanges = false;

    for(var i = tasks.length - 1; i >= 0; i--) {
      if(tasks[i].fromLastTask) {
        tasks.splice(i, 1);
        anyChanges = true;
      }
    }

    for(i = lastTasks.length - 1; i >= 0; i--) {
      if(!lastTasks[i].completed) {
        var initialTask = lastTasks[i].initialTask;
        if(initialTask === -1) initialTask = lastTasks[i].id;
        var tempTask = { name: lastTasks[i].name, estimate:'', fromLastTask: true, initialTask: initialTask };
        tasks.unshift(tempTask);
        anyChanges = true;
      }
    }

    if(anyChanges) {

      this.setState( { tasks: tasks, renderIndex: this.state.renderIndex + 1 });
    }
  }

  submit(e) {
    e.preventDefault();
    if(!this.state.valid) return;
    if(this.timer) return;
    if(this.ongoingSubmit) return;

    /* SIMPLE VALIDATE */
    var valid = true;
    for(var i = 0; i < this.state.questions.length; i++) {
      if(this.state.questions[i].length === 0) {
        this.setState( { error: true, showAlert: true, alertMessage: 'Please answer all questions.' } );
        valid = false;
        break;
      }
    }

    if(!valid) return;

    /* IF LAST TASK NOT COMPLETED MUST PROVIDE REASON */
    var needReason = false;
    for(i = 0; i < this.state.lastTasks.length; i++) {
      if(!this.state.lastTasks[i].completed) {
        if(!this.state.lastTasks[i].changes || this.state.lastTasks[i].changes.length === 0) {
          needReason = true;
          break;
        }
      }
    }

    if(needReason) {
      this.setState( { error: true, showAlert: true, alertMessage: 'Provide changes reason for not completed task.' } );
      return;
    }

    /* AT LEAST ON TASK IN NEW PLAN */
    var oneTask = false;
    for(i = 0; i < this.state.tasks.length; i++) {
      if(this.state.tasks[i].name.length > 0 && this.state.tasks[i].estimate.length > 0) {
        oneTask = true;
        break;
      }
    }

    if(!oneTask) {
      this.setState( { error: true, showAlert: true, alertMessage: 'Please enter atleast one task and estimate in 5 day plan.' } );
      return;
    }

    /* TASKS MUST HAVE ESTIMATES */
    var allTasksHasEstimate = true;
    for(i = 0; i < this.state.tasks.length; i++) {
      if(this.state.tasks[i].name.length === 0 && this.state.tasks[i].estimate.length === 0) continue;
      if(this.state.tasks[i].name.length > 0 && this.state.tasks[i].estimate.length > 0) continue;

      allTasksHasEstimate = false;
      break;
    }
    if(!allTasksHasEstimate) {
      this.setState( { error: true, showAlert: true, alertMessage: 'All tasks in plan must have estimate hour.' } );
      return;
    }

    var tasks = '';
    var estimates = '';
    var new_estimates = '';
    var initialTasks = '';
    this.state.tasks.map(function(taskData) {

      if(taskData.name.length > 0) {
        if(tasks !== '') tasks = tasks + ',' + taskData.name.replace(/,/g,'&#44;').replace(/[^\x0D\x0A\x20-\x7E]/g,'');
        else tasks = taskData.name.replace(/,/g,'&#44;').replace(/[^\x0D\x0A\x20-\x7E]/g,'');

        if(estimates !== '') estimates = estimates + ',' + taskData.estimate;
        else  estimates = taskData.estimate;

        if(initialTasks !== '') initialTasks = initialTasks + ',' + taskData.initialTask;
        else  initialTasks = taskData.initialTask;

        if(taskData.fromLastTask) {
          if(new_estimates !== '') new_estimates = new_estimates + ',' + taskData.estimate;
          else  new_estimates = taskData.estimate;
        }
      }
    });

    var changedTaskIds = '';
    var changes = '';
    var completedTaskIds = '';
    var completeNames = ''; /* FOR SENDING EMAIL - DONT NEED TO RETRIVE DB */
    this.state.lastTasks.map(function(taskData) {
      if(!taskData.completed) {
        if(changedTaskIds !== '') changedTaskIds = changedTaskIds + ',' + taskData.id;
        else changedTaskIds = taskData.id;

        if(changes !== '') changes = changes + ',' + taskData.changes.replace(/,/g,'&#44;').replace(/[^\x0D\x0A\x20-\x7E]/g,'');
        else  changes = taskData.changes.replace(/,/g,'&#44;').replace(/[^\x0D\x0A\x20-\x7E]/g,'');
      }
      else {
        if(completedTaskIds !== '') completedTaskIds = completedTaskIds + ',' + taskData.id;
        else completedTaskIds = taskData.id;

        if(completeNames !== '') completeNames = completeNames + ',' + taskData.name.replace(/,/g,'&#44;').replace(/[^\x0D\x0A\x20-\x7E]/g,'');
        else completeNames = taskData.name.replace(/,/g,'&#44;').replace(/[^\x0D\x0A\x20-\x7E]/g,'');
      }
    });

    var body = {
      action: 'standup',
      userId: this.props.userId,
      earlyOrLate: this.state.earlyOrLate,
      answers: this.state.questions.join(','),
      tasks: tasks,
      estimates: estimates,
      initialTasks: initialTasks,
      changedTaskIds: changedTaskIds,
      changes: changes,
      completedTaskIds: completedTaskIds,
      new_estimates: new_estimates,
      completes: completeNames
    }

    this.ongoingSubmit = true;
    var self = this;
    axios.post(routeNames.API_DEV, body)
    .then(function(response) {
      var data = response.data;

      if(data.success)
      {
        self.setState( { error: false, showAlert: true, alertMessage: 'Standup data saved. Thank you!' } );
        /* RELOAD */
        self.timer = setInterval(self.invalidateAfterSubmit, 3000);
      }
      else {
        self.setState( { error: true, showAlert: true, alertMessage: 'Bad request, please try again!' } );
        self.ongoingSubmit = false;
      }
    })
    .catch(function(_err){
      if(_err && _err.response && _err.response.status === 401) {
        var action = userLoggedOutAction();
        self.props.dispatch(action);
        self.props.history.push(routeNames.LOGIN);
        return;
      }
      self.setState( { error: true, showAlert: true, alertMessage: 'Bad request, please try again!' } );
      self.ongoingSubmit = false;
    });
  }

  invalidateAfterSubmit() {
    if(this.timer) clearInterval(this.timer);
    this.setState({ valid: false, submitted: true });
  }

  outOfTime() {
    this.setState({ valid: false });
  }

  render() {

    var self = this;
    /* LAST TASKS */
    var lastTasks;
    if(this.state.lastTasks.length === 0) {
      /*lastTasks = <div className='questionTitle'><h5>You have no tasks plan input.</h5></div>*/
    }
    else {
      lastTasks = this.state.lastTasks.map(function(taskData, index) {
        return <div className='row' key={'lastTaskRow_' + index}>
                  <div className='col-4 planHeader'><h5>{taskData.name ? taskData.name.replace(/&#44;/g,','):''}</h5></div>
                  <div className='col-2 planHeader'><h5>{taskData.time_estimate}</h5></div>
                  <div className='col-4 planHeader'><FormControl className='taskTextbox' maxLength='450' type='text' placeholder='Changes' disabled={taskData.completed} onChange={(e) => { self.lastTaskEstimateChange(e, index); }} defaultValue={taskData.changes ? taskData.changes.replace(/&#44;/g,','):''}  /></div>
                  <div className='col-2 planHeader'><FormControl className='taskTextbox' type='checkbox' onChange={(e) => { self.checkChanged(e, index); }} /></div>
              </div>
      });
    }
    /* NEW TASKS */
    var tasks = this.state.tasks.map(function(taskData, index) {

      return <div className='row' key={'taskRow_' + index + self.state.renderIndex}>
                <div className='col-7 planHeader'><FormControl className='taskTextbox' type='text' maxLength='450' placeholder='Task name' disabled={taskData.fromLastTask} onChange={(e) => { self.taskNameChange(e, index); }} defaultValue={taskData.name ? taskData.name.replace(/&#44;/g,','):''} /></div>
                <div className='col-5 planHeader'><FormControl className='taskTextbox' type='text' maxLength='1' placeholder='Estimate (1-8)' onChange={(e) => { self.taskEstimateChange(e, index); }} defaultValue={taskData.estimate}  /></div>
            </div>
    });


    var zeroHour = new Date();
    zeroHour.setHours(0, 0, 0, 0);
    var dateText = zeroHour.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    /* EARLY, ONTIME, LATE */
    var stateClassName = 'standupState float-right';
    if(this.state.submitted) stateClassName += ' text-success';
    else if(this.state.standupWindowState === standupTimeWindowState.ONTIME) stateClassName += ' text-success';
    else if(this.state.standupWindowState === standupTimeWindowState.EARLY) stateClassName += ' text-warning';
    else stateClassName += ' text-danger';

    var standupState;
    if(this.state.submitted) standupState = 'TODAY STANDUP SUBMITTED';
    else {
      if(this.state.valid) {
        stateClassName += ' smallandup';
        if(this.state.standupWindowState === standupTimeWindowState.ONTIME) standupState = `You are ontime for your ${this.state.standupTime} (${this.state.standupTimeZone}) standup`;
        else if(this.state.standupWindowState === standupTimeWindowState.EARLY) standupState = `You are early for your ${this.state.standupTime} (${this.state.standupTimeZone}) standup`;
        else if(this.state.standupWindowState === standupTimeWindowState.LATE) standupState = `You are late for your ${this.state.standupTime} (${this.state.standupTimeZone}) standup`;
      }
      else {
        if(this.state.standupWindowState === standupTimeWindowState.EARLY) standupState = `You are too early for your ${this.state.standupTime} (${this.state.standupTimeZone}) standup. Comeback in ${this.state.earlyOrLate}!`;
        else if(this.state.standupWindowState === standupTimeWindowState.LATE) standupState = `You are too late for your ${this.state.standupTime} (${this.state.standupTimeZone}) standup.`;
      }
    }

    return (
      <div className='container fillHeight'>
        <div className='row w-100 fillHeight'>
          <div className='col-sm-12 col-md-3 fillHeight'>
            <LeftMenu />
          </div>
          <div className='col-sm-12 col-md-9 bg-white setupView fillHeight'>
            <div className='row header'><h2>Welcome {this.props.full_name ? this.props.full_name.split(' ')[0] : 'developer'}!</h2></div>
            {/* STANDUP CONTENT: OH, WE HAVE DYNAMIC LIST OF QUESTIONS, BUT WE DIDN'T HAVE ANY DATA FIELD TO INDICATE WHAT QUESTION CAN BE MULTIPLE AND ADDITIONAL DATA (FOR EXAMPLE, THE 3 DAY TASKS) */
            /* SO, WE HARD CODE THE FORMS HERE FOR NOW */}
            <div className={'row' + (this.state.submitted ? ' justify-content-center':'')}>
              <div className={stateClassName}>{standupState}</div>
            </div>

            {/*
            <div className={'invalidTimeToStandup' + ((this.state.valid && this.state.timeLeft > 0) ? ' hidden':'')}>
              <h5>You already submitted your standup for today, or its not valid time.<br/><br/>Remember if you missed, you can't do the standup anymore for that day.</h5>
            </div>
            */}

            <div className={'col standupForm' + ((this.state.valid && this.state.timeLeft > 0) ? '':' hidden')}>
              <div className='row float-right'><StandupClock timeLeft={this.state.timeLeft} key={this.state.clock_key} outOfTime={this.outOfTime} /></div>
              <div className='row intro'><h2>Standup items for {dateText}</h2></div>
              <div className='row questionTitle'><h4><strong>What did you work on yesterday?</strong></h4></div>
              <div className='row'><Form.Control as='textarea' rows='4' maxLength='900' onChange={(e) => { this.questionChange(e, 0); }} /></div>
              <div className='row questionTitle'><h4><strong>What will you be working on today?</strong></h4></div>
              <div className='row'><Form.Control as='textarea' rows='4' maxLength='900' onChange={(e) => { this.questionChange(e, 1); }} /></div>
              <div className='row questionTitle'><h4><strong>Any questions or blockers?</strong></h4></div>
              <div className='row'><Form.Control as='textarea' rows='4' maxLength='900' onChange={(e) => { this.questionChange(e, 2); }} /></div>
              {/* THE LAST TASKS WILL BE LISTED BEFORE NEXT PLAN */}
              <div className={'row questionTitle' + ((this.state.valid && this.state.lastTasks.length > 0) ? '':' hidden') }><h4><strong>Has there been any change to your previous estimates?</strong></h4></div>
              <div className={'row' + ((this.state.valid && this.state.lastTasks.length > 0) ? '':' hidden') }>
                <div className='col-4 planHeader'><h5><strong>Task Name</strong></h5></div>
                <div className='col-2 planHeader'><h5><strong>Estimated in hours</strong></h5></div>
                <div className='col-4 planHeader'><h5><strong>Changes</strong></h5></div>
                <div className='col-2 planHeader'><h5><strong>Completed?</strong></h5></div>
              </div>
              {lastTasks}
              <br/>
              <div className='row questionTitle'><h4><strong>What is your 5 Day Work plan?</strong></h4><h5><strong>&nbsp;(Split your task to smallest possible)</strong></h5></div>
              <div className='row'>
                <div className='col-7 planHeader'><h5><strong>Task Name</strong></h5></div>
                <div className='col-5 planHeader'><h5><strong>Estimate in hours</strong></h5></div>
              </div>
              {tasks}
              <div className='row buttonAddTask'>
                <div className='col-1 btn btn--light btn--rounded btn--full' onClick={this.addTasks}>+</div>
              </div>
              <br/>
              <Alert variant={this.state.error ? 'warning' : 'success'} show={this.state.showAlert ? true : false} className='alertMessage'>
                <p>{this.state.alertMessage}</p>
              </Alert>
              <br/>
              <div className='row'>
                <div className="col-3 btn btn--dark btn--rounded btn--full" onClick={this.submit}>Submit</div>
              </div>
              <br/><br/><br/>

            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = appState => ({
  full_name: appState.userRoot.user.full_name,
  userId: appState.userRoot.user.id,
  role_type_id: appState.userRoot.user.role_type_id
});

export default withRouter(connect(mapStateToProps)(DevStandupView));
