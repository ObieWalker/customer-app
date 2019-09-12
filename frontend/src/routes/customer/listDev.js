import React, { Component } from "react";
import LeftMenu from "../../components/common/LeftMenu";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import FormControl from "react-bootstrap/FormControl";
import Pagination from "react-bootstrap/Pagination";
import Alert from "react-bootstrap/Alert";
import DayPickerInput from "react-day-picker/DayPickerInput";
import DevList from "../../components/Dashboard/views/customer/DevList";
import routeNames from "../../constants/routeNames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import "./listDev.css";
import "react-day-picker/lib/style.css";

import { userLoggedOutAction } from "../../reducers/userActions";

class ListDevView extends Component {
  constructor(_props) {
    super(_props);

    this.state = {
      currentPage: 0,
      itemPerPage: 10,
      developers: [],
      count: null,
      activeCount: null,
      devFilter: "activeDevelopers",
      filterComponents: {
        input: "",
        startDate: "",
        endDate: "",
        filterTodayActive: false,
        filterYesterdayActive: false
      },
      clearFilter: {
        active: false
      }
    };

    this.getDeveloperList = this.getDeveloperList.bind(this);
    this.startDayChange = this.startDayChange.bind(this);
    this.endDayChange = this.endDayChange.bind(this);
    /*
    this.viewDetailDev = this.viewDetailDev.bind(this);*/
    this.favouriteDev = this.favouriteDev.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.filterChange = this.filterChange.bind(this);
    this.filterByTodayStandups = this.filterByTodayStandups.bind(this);
    this.filterByYesterdayStandups = this.filterByYesterdayStandups.bind(this);
    this.countDeveloperList = this.countDeveloperList.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.gotoFirstPage = this.gotoFirstPage.bind(this);
    this.gotoLastPage = this.gotoLastPage.bind(this);
    this.gotoPrevPage = this.gotoPrevPage.bind(this);
    this.gotoNextPage = this.gotoNextPage.bind(this);
    this.nextPartPage = this.nextPartPage.bind(this);
    this.prevPartPage = this.prevPartPage.bind(this);
    this.changeDevFilter = this.changeDevFilter.bind(this);
    this.getDevCounts = this.getDevCounts.bind(this);
    this.handleClearFilter = this.handleClearFilter.bind(this);
  }

  componentDidMount() {
    /* CHECK ROLE */
    if (this.props.role_type_id !== 4 && this.props.role_type_id !== 2) {
      /* LOG OUT AND FORCE TO LOGIN PAGE */
      var action = userLoggedOutAction();
      this.props.dispatch(action);
      this.props.history.push(routeNames.LOGIN);
      return;
    }
    this.countDeveloperList();
    this.getDeveloperList();
  }

  componentDidUpdate(prevProps) {
    if (this.props.developers !== prevProps.developers) {
      this.handleDevList(this.props.developers)
    }
    if (this.props.count !== prevProps.count) {
      this.handleOnDevCount(this.props.count, this.props.activeCount)
    }
    if (this.props.addToFav !== prevProps.addToFav) {
      this.handleAddToFav(this.props.addToFav)
    }
  }

  componentWillMount() {
    this.timeouts = [];
  }
  componentWillUnmount() {
    this.clearTimeouts();
  }

  getDeveloperList(filter, startStandupDate, endStandupDate, devFilter) {
    var body = {
      action: "list",
      startItem: this.state.currentPage * this.state.itemPerPage,
      count: this.state.itemPerPage,
      startStandupDate: startStandupDate,
      endStandupDate: endStandupDate,
      filter: filter,
      devFilter: this.state.devFilter
    };

    this.props.onGetDeveloperList(body)
  }

  getDevCounts() {
    const body = {
      action: "inital_counts"
    };
    this.props.onGetDeveloperList(body)
  }

  countDeveloperList(filter, startStandupDate, endStandupDate, devFilter) {
    var body = {
      action: "count_list",
      startStandupDate: startStandupDate,
      endStandupDate: endStandupDate,
      filter: filter,
      devFilter: devFilter
    };
    this.props.onCountDevelopers(body)
  }

  handleOnDevCount = (count, activeCount) => {
    if (count) {
      this.setState({ count, activeCount });
    } else this.setState({ count: 0 });
  }

  handleDevList = (developers) => {
    if(developers) {
      this.setState({ developers });
    } else {
      var action = userLoggedOutAction();
      this.props.dispatch(action);
      this.props.history.push(routeNames.LOGIN);
    }
  }

  startDayChange(day) {
    // this.startDate = day;
    this.setState(
      {
        ...this.state,
        filterComponents: {
          ...this.state.filterComponents,
          startDate: day
        }
      },
      () => {
        this.startDate = this.state.filterComponents.startDate;
      }
    );
  }

  endDayChange(day) {
    //this.endDate = day;

    this.setState(
      {
        ...this.state,
        filterComponents: {
          ...this.state.filterComponents,
          endDate: day
        }
      },
      () => {
        this.endDate = this.state.filterComponents.endDate;
      }
    );
  }

  favouriteDev(devId) {
    var body = {
      action: "fav_dev",
      customerId: this.props.userId,
      devId: devId
    };

    this.props.addDevToFav(body)
  }

  handleAddToFav = () => {
    this.setState({
      error: false,
      showAlert: true,
      alertMessage: "Added developer to favourite list!"
    });
    this.timer = setTimeout(() => {
      this.closeAlert();
    }, 3000);
  }

  clearTimeouts = () => {
    this.timeouts.forEach(clearTimeout);
  };
  setTimeouts = requests => {
    this.timeouts.push(requests);
  };
  detectKeyPress = () => {
    if (this.state.filterComponents.input.length > 2) {
      this.clearTimeouts();
      this.setTimeouts(
        setTimeout(() => {
          this.applyFilter();
        }, 2000)
      );
    } else if (this.state.filterComponents.input.length === 0) {
      this.applyFilter();
      if (
        this.state.filterComponents.input === "" &&
        this.state.filterComponents.endDate === "" &&
        this.state.filterComponents.startDate === "" &&
        this.filterTodayActive === false &&
        this.filterYesterdayActive === false
      ) {
        this.setState({
          clearFilter: {
            active: false
          }
        });
      }
    }
  };

  filterChange(e) {
    //this.filterName = e.target.value;
    this.setState(
      {
        ...this.state,
        filterComponents: {
          ...this.state.filterComponents,
          input: e.target.value
        }
      },
      () => {
        this.filterName = this.state.filterComponents.input;
        this.detectKeyPress();
      }
    );
  }

  applyFilter() {
    const devFilter = this.state.devFilter;
    var startStandupDate = "";
    var endStandupDate = "";
    if (
      this.state.filterComponents.input !== "" ||
      this.state.filterComponents.endDate !== "" ||
      this.state.filterComponents.startDate !== "" ||
      this.filterTodayActive !== false ||
      this.filterYesterdayActive !== false
    ) {
      this.setState({
        ...this.state,
        clearFilter: {
          active: true
        }
      });
    }

    if (
      this.state.filterComponents.startDate !== "" &&
      this.state.filterComponents.startDate !== ""
    ) {
      if (this.startDate) {
        startStandupDate = this.startDate;
        endStandupDate = startStandupDate;
      }
      if (this.endDate) {
        endStandupDate = this.endDate;
        if (startStandupDate === "") startStandupDate = endStandupDate;
      }
    }
    this.filterTodayActive = false;
    this.filterYesterdayActive = false;

    this.getDeveloperList(
      this.filterName,
      startStandupDate,
      endStandupDate,
      devFilter
    );
    this.countDeveloperList(
      this.filterName,
      startStandupDate,
      endStandupDate,
      devFilter
    );
    this.setToFirstPage();
  }

  setToFirstPage = () => {
    //Set to first page each time a filter is applied

    this.gotoFirstPage();
  };

  handleClearFilter = () => {
    this.setState(
      {
        ...this.state,
        filterComponents: {
          ...this.state.filterComponents,
          input: "",
          startDate: "",
          endDate: "",
          filterYesterdayActive: false,
          filterTodayActive: false
        },
        clearFilter: {
          active: false
        }
      },
      () => {
        this.filterName = this.state.filterComponents.input;
        this.startDate = this.state.filterComponents.startDate;
        this.endDate = this.state.filterComponents.endDate;
        this.filterYesterdayActive = this.state.filterComponents.filterYesterdayActive;
        this.filterTodayActive = this.state.filterComponents.filterTodayActive;
        this.applyFilter();
      }
    );
  };

  filterByTodayStandups() {
    var startStandupDate = "";
    var endStandupDate = "";

    if (!this.filterTodayActive) {
      startStandupDate = new Date();
      endStandupDate = startStandupDate;
      this.filterTodayActive = true;
      this.filterYesterdayActive = false;
      this.setState({
        ...this.state,
        clearFilter: {
          active: true
        }
      });
    } else {
      if (
        this.state.filterComponents.input === "" &&
        this.state.filterComponents.endDate === "" &&
        this.state.filterComponents.startDate === ""
      ) {
        this.setState({
          ...this.state,
          clearFilter: {
            active: false
          }
        });
      }

      this.filterTodayActive = false;
    }

    //this.getDeveloperList(this.filterName, startStandupDate, endStandupDate);
    this.startDate = startStandupDate;
    this.endDate = endStandupDate;
    this.getDeveloperList(
      this.filterName,
      startStandupDate,
      endStandupDate,
      this.state.devFilter
    );
    this.countDeveloperList(
      this.filterName,
      startStandupDate,
      endStandupDate,
      this.state.devFilter
    );
  }

  filterByYesterdayStandups() {
    var startStandupDate = "";
    var endStandupDate = "";

    if (!this.filterYesterdayActive) {
      var today = new Date();
      today.setDate(today.getDate() - 1);

      startStandupDate = today;
      endStandupDate = startStandupDate;
      this.filterTodayActive = false;
      this.filterYesterdayActive = true;

      this.setState({
        ...this.state,
        clearFilter: {
          active: true
        }
      });
    } else {
      if (
        this.state.filterComponents.input === "" &&
        this.state.filterComponents.endDate === "" &&
        this.state.filterComponents.startDate === ""
      ) {
        this.setState({
          ...this.state,
          clearFilter: {
            active: false
          }
        });
      }
      this.filterYesterdayActive = false;
    }

    //this.getDeveloperList(this.filterName, startStandupDate, endStandupDate);
    this.startDate = startStandupDate;
    this.endDate = endStandupDate;
    this.getDeveloperList(
      this.filterName,
      startStandupDate,
      endStandupDate,
      this.state.devFilter
    );
    this.countDeveloperList(
      this.filterName,
      startStandupDate,
      endStandupDate,
      this.state.devFilter
    );
  }

  closeAlert() {
    clearTimeout(this.timer);
    this.setState({
      error: false,
      showAlert: false,
      alertMessage: "Added developer to favourite list!"
    });
  }

  gotoPage(e) {
    var page = e.target.text - 1;
    if (page < 0) page = 0;
    var totalPage = Math.ceil(this.state.count / this.state.itemPerPage);

    if (page !== 0 && page >= totalPage) page = totalPage - 1;
    if (page === this.state.currentPage) return;
    var self = this;
    this.setState({ currentPage: page }, function () {
      var startStandupDate = "";
      var endStandupDate = "";
      if (self.startDate) {
        startStandupDate = self.startDate;
        endStandupDate = startStandupDate;
      }
      if (self.endDate) {
        endStandupDate = self.endDate;
        if (startStandupDate === "") startStandupDate = endStandupDate;
      }
      //self.getDeveloperList(this.filterName, startStandupDate, endStandupDate);
      const devFilter = self.state.devFilter;
      self.getDeveloperList(
        self.filterName,
        startStandupDate,
        endStandupDate,
        devFilter
      );
      self.countDeveloperList(
        self.filterName,
        startStandupDate,
        endStandupDate,
        devFilter
      );
    });
  }

  /* MY CODE HERE IS SO FUNNY =)) */
  gotoFirstPage() {
    this.gotoPage({ target: { text: 0 } });
  }

  gotoLastPage() {
    var totalPage = Math.ceil(this.state.count / this.state.itemPerPage);
    this.gotoPage({ target: { text: totalPage } });
  }

  gotoPrevPage() {
    this.gotoPage({ target: { text: this.state.currentPage } });
  }

  gotoNextPage() {
    this.gotoPage({ target: { text: this.state.currentPage + 2 } });
  }

  nextPartPage() {
    this.gotoPage({ target: { text: this.state.currentPage + 11 } });
  }

  prevPartPage() {
    this.gotoPage({ target: { text: this.state.currentPage - 9 } });
  }

  changeDevFilter(e) {
    e.preventDefault();
    const filter = e.target.dataset.devFilter;
    this.setState({ devFilter: filter }, () => {
      this.applyFilter();
    });
  }

  render() {
    // used by DevList -- Mitch Kroska 4-24-2019
    const developerProps = {
      developers: this.state.developers,
      /*viewDetailDev: this.viewDetailDev*/ linkTo:
        routeNames.CUSTOMER_VIEW_DEV,
      favouriteDev: this.favouriteDev,
      userRole: this.props.role_type_id,
      noFav: false
    };

    // used to switch the selection class between allDevs and activeDevs Filter -- Mitch Kroska 4-24-2019
    const allDevsClass =
      this.state.devFilter === "allDevelopers" ? "selected-dev-filter" : "";
    const activeDevsClass =
      this.state.devFilter === "activeDevelopers" ? "selected-dev-filter" : "";

    var items = [];

    var startPage =
      this.state.itemPerPage *
      Math.floor(this.state.currentPage / this.state.itemPerPage);

    var endPage = startPage + 10;
    const devTotal =
      this.state.devFilter === "activeDevelopers"
        ? this.state.activeCount
        : this.state.count;
    var totalPage = Math.ceil(devTotal / this.state.itemPerPage);
    if (endPage > totalPage) endPage = totalPage;

    if (this.state.currentPage >= 10)
      items.push(
        <Pagination.Ellipsis
          key={"pagePrevPart_" + startPage}
          onClick={this.prevPartPage}
        />
      );

    for (var i = startPage; i < endPage; i++) {
      items.push(
        <Pagination.Item
          key={"item_" + i}
          onClick={this.gotoPage}
          active={this.state.currentPage === i ? true : false}
        >
          {i + 1}
        </Pagination.Item>
      );
    }

    if (endPage < totalPage)
      items.push(
        <Pagination.Ellipsis
          key={"pageNextPart_" + endPage}
          onClick={this.nextPartPage}
        />
      );

    var pagination = (
      <Pagination>
        <Pagination.First onClick={this.gotoFirstPage} />
        <Pagination.Prev onClick={this.gotoPrevPage} />
        {items}
        <Pagination.Next onClick={this.gotoNextPage} />
        <Pagination.Last onClick={this.gotoLastPage} />
      </Pagination>
    );

    return (
      <div className="container fillHeightListDev">
        <div className="row w-100 fillHeightListDev">
          <div className="col-sm-12 col-md-3 fillHeightListDev">
            <LeftMenu />
          </div>
          <div className="col-sm-12 col-md-9 h-100 bg-white setupView">
            <div className="row header">
              <h2>
                Welcome{" "}
                {this.props.full_name ? this.props.full_name : " Customer!"}!
              </h2>
            </div>
            <div className="row subTitle">
              <h5>Filter by developer name/email</h5>
            </div>
            <div className="row inputTextbox">
              <FormControl
                className="nameTextbox"
                type="text"
                value={this.state.filterComponents.input}
                onChange={this.filterChange}
              />
            </div>

            <div className="row subTitle">
              <h5>Filter by standup date</h5>
            </div>
            <div className="row inputTextbox">
              <div
                className={
                  "roundButton" +
                  (this.filterTodayActive ? " buttonActive" : "")
                }
                onClick={this.filterByTodayStandups}
              >
                Today
              </div>
              <div
                className={
                  "roundButton" +
                  (this.filterYesterdayActive ? " buttonActive" : "")
                }
                onClick={this.filterByYesterdayStandups}
              >
                Yesterday
              </div>
              <div className="separateText">Custom</div>
              <DayPickerInput
                onDayChange={this.startDayChange}
                value={this.state.filterComponents.startDate}
                className="dateInput"
              />
              <div className="separateText">-</div>
              <DayPickerInput
                onDayChange={this.endDayChange}
                value={this.state.filterComponents.endDate}
                className="dateInput"
              />
              <div className="roundButton" onClick={this.applyFilter}>
                Apply
              </div>
            </div>
            {this.state.clearFilter.active && (
              <div className="row mt-2">
                <div className="col-md-12">

                  <Link to={this.props.match.params} onClick={this.handleClearFilter}>

                    <FontAwesomeIcon icon={faTimes} /> Clear Filter
                  </Link>
                </div>
              </div>
            )}
            <div className="row subTitle">
              <h5>
                <a
                  href=""
                  onClick={this.changeDevFilter}
                  data-dev-filter="activeDevelopers"
                  className={activeDevsClass}
                >
                  Active Developers ({this.state.activeCount})
                </a>
              </h5>
              /{" "}
              <h5>
                <a
                  href=""
                  onClick={this.changeDevFilter}
                  data-dev-filter="allDevelopers"
                  className={allDevsClass}
                >
                  All Developers ({this.state.count})
                </a>
              </h5>
            </div>

            <div className="row subTitle">{pagination}</div>
            <div
              className={
                "row" + (this.state.developers.length > 0 ? "" : " hidden")
              }
            >
              <DevList {...developerProps} />
            </div>
            <div
              className={
                "row" + (this.state.developers.length === 0 ? "" : " hidden")
              }
            >
              <h2>No developers found!</h2>
            </div>

            <br />
          </div>
          <Alert
            variant={this.state.error ? "warning" : "success"}
            show={this.state.showAlert ? true : false}
            className="absoluteAlertMessage"
          >
            <p>{this.state.alertMessage}</p>
          </Alert>
        </div>
      </div>
    );
  }
}

const mapStateToProps = appState => ({
  full_name: appState.userRoot.user.full_name,
  userId: appState.userRoot.user.id,
  role_type_id: appState.userRoot.user.role_type_id,
  developers: appState.customer.devList,
  count: appState.customer.count,
  activeCount: appState.customer.activeCount,
  addToFav: appState.customer.addToFav

});

const mapDispatchToPops = dispatch => {
  return {
    onGetDeveloperList: (data) => dispatch({ type: "GET_DEV_LIST", data }),
    onCountDevelopers: (data) => dispatch({ type: "COUNT_DEV_LIST", data }),
    addDevToFav: (data) => dispatch({ type: "ADD_TO_FAV", data }),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToPops)(ListDevView));
