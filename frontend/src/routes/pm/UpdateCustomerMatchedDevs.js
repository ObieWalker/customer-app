import React, { useEffect, useState } from 'react'
import LeftMenu from '../../components/common/LeftMenu'
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import axios from 'axios';
import routeNames from '../../constants/routeNames';
import { userLoggedOutAction } from '../../reducers/userActions';
import DevelopersList from './DevelopersList';


const UpdateCustomerMatchedDevs = props => {
    var customerId = props.match.params.customerId;
    var [errors, setErrors] = useState({});
    var [selectedList, setSelectedList] = useState([]);
    var [showSuccessMessage, setShowSuccessMessage] = useState(false);
    var defaultData = { action: "updateMatchedList", customerId };
    var [data, setData] = useState(defaultData);
    var DevelopersListEvents = {};
    useEffect(() => {
        axios.post(routeNames.API_PM, { action: "getMatchedList", customerId })
            .then(response => {
                var rep = response.data;
                if (rep.success && rep.list) {
                    data = { ...data, driName: rep.list[0].DRIName, driEmail: rep.list[0].DRIEmail };
                    setSelectedList(rep.list);
                    if (DevelopersListEvents.updateSelectedList) {
                        DevelopersListEvents.updateSelectedList(rep.list);
                    }
                    setData(data);
                }
            })
            .catch(_err => {
                if (_err && _err.response && _err.response.status === 401) {
                    var action = userLoggedOutAction();
                    props.dispatch(action);
                    props.history.push(routeNames.LOGIN);
                    return;
                }
            });
    }, []);

    const bind = varName => ({
        value : data[varName] || "",
        className: "form-control" + (errors[varName] ? " is-invalid" : ""),
        onChange: e => setData({ ...data, [varName]: e.target.value })
    });

    const invalidInput = (varName, message = null) => {
        errors = {
            ...errors,
            [varName]: true,
            [varName + 'Message']: message
        };
        setErrors(errors);
    }
    const submitNewCustomerHandler = e => {
        e.preventDefault();

        if (selectedList.length === 0) {
            invalidInput("devs", "Please select developers.");
        } else {
            setErrors({});
            data.devs = selectedList.map(elm => elm.id);
            axios.post(routeNames.API_PM, data)
                .then(response => {
                    var rep = response.data;
                    if (rep.success) {
                        setErrors({});
                        setData(defaultData);
                        setShowSuccessMessage(true);
                        setTimeout(() => {
                            setShowSuccessMessage(false);
                        }, 2000);
                    } else if (rep.errors && rep.errors.length) {
                        rep.errors.map(({ name, message }) => invalidInput(name, message))
                    }
                })
                .catch(_err => {
                    if (_err && _err.response && _err.response.status === 401) {
                        var action = userLoggedOutAction();
                        props.dispatch(action);
                        props.history.push(routeNames.LOGIN);
                        return;
                    }
                });
        }
    }


    const unauthorize = () => {
      var action = userLoggedOutAction();
      props.dispatch(action);
      props.history.push(routeNames.LOGIN);
    }

    return (
        <div className='container fillHeightListDev'>
            <div className='row w-100 fillHeightListDev'>
                <div className='col-sm-12 col-md-3 fillHeightListDev'>
                    <LeftMenu />
                </div>
                <div className='col-sm-12 col-md-9 h-100 bg-white setupView'>
                    <div className='header'><h2>Welcome {props.full_name ? props.full_name : ''}!</h2></div>
                    <div className='subTitle'><h3>Update Matched Developers List</h3></div>
                    <hr />
                    {showSuccessMessage ? (
                        <div className="alert alert-success">
                            Record has been saved successfully.
                        </div>
                    ) : (
                            <form onSubmit={submitNewCustomerHandler}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <label>Developers List</label>
                                        <DevelopersList onChange={setSelectedList} events={DevelopersListEvents} unauthorize={unauthorize} />
                                    </div>
                                    <div className="col-md-6">
                                        <label>Selected Developers List</label>
                                        <p>{selectedList.length + ' Developer' + (selectedList.length > 1 ? 's' : '') + ' selected'}</p>
                                        <table className="table table-striped" style={{ zoom: 0.7 }}>
                                            <thead>
                                                <tr>
                                                    <th scope="col">Name</th>
                                                    <th scope="col">Email</th>
                                                    <th scope="col" className="colaction"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedList.map(item => (
                                                    <tr key={item.id}>
                                                        <td>{item.name}</td>
                                                        <td>{item.email}</td>
                                                        <td className="colaction" style={{ padding: 11 }}>
                                                            <button type="button" onClick={item.uncheck} >X</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {errors.devsMessage && selectedList.length === 0 ? <div className="alert alert-danger">{errors.devsMessage}</div> : null}
                                    </div>

                                    <div className="form-group col-md-6">
                                        <hr />
                                        <label>DRI Name</label>
                                        <input type="text" required placeholder="Enter name" {...bind("driName")} />
                                        {errors.driNameMessage ? <div className="invalid-feedback">{errors.driNameMessage}</div> : null}
                                    </div>
                                    <div className="form-group col-md-6">
                                        <hr />
                                        <label>DRI Email</label>
                                        <input type="email" required placeholder="Enter email" {...bind("driEmail")} />
                                        {errors.driEmailMessage ? <div className="invalid-feedback">{errors.driEmailMessage}</div> : null}
                                    </div>

                                    <div className="col-md-12">
                                        <hr />
                                        <button type="submit" className="btn btn--dark">Submit</button>
                                    </div>

                                </div>
                            </form>
                        )}
                </div>
            </div>
        </div>
    )
}



const mapStateToProps = appState => ({
    full_name: appState.userRoot.user.full_name,
    userId: appState.userRoot.user.id,
    role_type_id: appState.userRoot.user.role_type_id
});
export default withRouter(connect(mapStateToProps)(UpdateCustomerMatchedDevs));
