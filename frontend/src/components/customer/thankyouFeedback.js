import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import NotHappy from "../../assets/NotHappy_Icon.png";
import Okay from "../../assets/OK_Icon.png";
import Good from "../../assets/Good_Icon.png";
import Great from "../../assets/Great_Icon.png";
import "./feedback.css";
import decode from "jwt-decode";
import { Link } from "react-router-dom";

class ThankyouFeedback extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: null,
      feedBackData:{
        devId:null
      },
      listOfEmotions: [
        { id: 0,name:"Not Happy", img: NotHappy },
        { id: 1,name:"Okay", img: Okay },
        { id: 2,name:"Good", img: Good },
        { id: 3,name:"Great", img: Great }
      ],
      feedBackSaved:false,
      tokenValid: true
    };
    this.selectedRating = this.selectedRating.bind(this);
    var url = new URL(window.location.href);
    this.token = url.searchParams.get('feedbacktoken');


    }

  componentDidMount() {
    var url = new URL(window.location.href);
    var token = url.searchParams.get('feedbacktoken');

    const decoded = decode(token);
    var feedBackData = decoded.feedBackData;
    if (decoded.exp > Date.now() / 1000) {
      // check if the token is valid

      this.setState({
        ...this.state,
        selected: decoded.feedBackData.feedbackValue,
        feedBackData:feedBackData,
        devId:feedBackData.devId
      });
      this.props.onSendRating({
        action: "rate",
        customerId:feedBackData.customerId,
        standupId:feedBackData.standupId,
        feedbackPublicLink:feedBackData.feedbackPublicLink,
        rate:feedBackData.feedbackValue,
        token:this.token
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.sendRating.success !== prevProps.sendRating.success) {
      this.setFeedbackState(this.props.sendRating)
    }
  }

  selectedRating = (e,id) => {
    this.setState((state)=>{
       return{ ...state,
        feedBackSaved:false}
    })
    this.setState((state)=>{
       return{...state,
        selected: id}
    });

    this.props.onSendRating({
      action: "rate",
      customerId:this.state.feedBackData.customerId,
      standupId:this.state.feedBackData.standupId,
      feedbackPublicLink:this.state.feedBackData.feedbackPublicLink,
      rate:id,
      token:this.token
    });
  };

  setFeedbackState = (sendRating) => {
    if(sendRating.success){
      this.setState({
        ...this.state,
        feedBackSaved:true,
        tokenValid:true
      })
    } else {
      this.setState({
        ...this.state,
        feedBackSaved:false,
        tokenValid:false
      })
    }
  }

  render({} = this.props) {
    const emotions = this.state.listOfEmotions.map((item, index) => {
      return (
        <div className="col-md-3 " key={item.id}>
          <div  className={` item ${
                item.id === this.state.selected ? "thick-border border-info" : ""
              }`} onClick={e=>this.selectedRating(e,item.id)}>
            <img
              className={`img-fluid `}
              src={item.img}
              alt="feedback"
            />
            <p><strong>{item.name}</strong></p>
          </div>
        </div>
      );
    });

    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <nav className="navbar navbar-light bg-dark">
              <span className="navbar-brand mb-0 h1 text-white">Turing Daily Standup</span>
            </nav>
          </div>
          <div className="col-md-12 mt-5 text-center">
            <h1><strong> Thank you for your Feedback</strong></h1>
          </div>

          <div className="col-md-12 mt-5 text-center">
            <div className="row">{emotions}</div>
          </div>
          <div className="col-md-12 mt-5 text-center">
            {this.state.feedBackSaved===true && <h3>Your feedback was recorded, but you still can change here</h3>}
            {this.state.tokenValid ===false && <h2 className="text-danger">Token expired, feedback not saved</h2>}
          </div>
          <div className="col-md-12 mt-5 text-center">
            <Link className="text-primary" to='/'>
              Go to daily Standup System
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = appState => ({
  full_name: appState.userRoot.user.full_name,
  userId: appState.userRoot.user.id,
  role_type_id: appState.userRoot.user.role_type_id,
  sendRating: appState.customer.sendRating
});

const mapDispatchToPops = dispatch => {
  return {
    onSendRating: (data) => dispatch({ type: "SEND_RATING", data }),
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToPops)(ThankyouFeedback));
