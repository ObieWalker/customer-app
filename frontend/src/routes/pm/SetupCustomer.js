import React, { useEffect, useState } from 'react'
import LeftMenu from '../../components/common/LeftMenu'
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import axios from 'axios';
import routeNames from '../../constants/routeNames';
import { userLoggedOutAction } from '../../reducers/userActions';
import DevelopersList from './DevelopersList';


const SetupCustomer = props => {
    let [errors, setErrors] = useState({});
    let [selectedList, setSelectedList] = useState([]);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const defaultData = { action: "newCustomer", name: "", email: "", password: "", confirmPassword: "" };
    const [data, setData] = useState(defaultData);
    const bind = varName => ({
        className: "form-control" + (errors[varName] ? " is-invalid" : ""),
        onChange: e => setData({ ...data, [varName]: e.target.value })
    });
    const bindCheckBox = varName => ({
        className: (errors[varName] ? " is-invalid" : ""),
        onChange: e => setData({ ...data, [varName]: e.target.checked })
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

        if (data.password !== data.confirmPassword) {
            invalidInput("password", "Confirmation password is not identical");
            invalidInput("confirmPassword", "Confirmation password is not identical");
        } else if (selectedList.length === 0) {
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
                    <div className='subTitle'><h3>Setup New Customer</h3></div>
                    {showSuccessMessage ? (
                        <div className="alert alert-success">
                            Record has been saved successfully.
                        </div>
                    ) : (
                            <form onSubmit={submitNewCustomerHandler}>
                                <div className="row">
                                    <div className="form-group col-md-6">
                                        <label>Name</label>
                                        <input type="text" required placeholder="Enter name" {...bind("name")} />
                                        {errors.nameMessage ? <div className="invalid-feedback">{errors.nameMessage}</div> : null}
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label>Email address</label>
                                        <input type="email" required placeholder="Enter email" {...bind("email")} />
                                        {errors.emailMessage ? <div className="invalid-feedback">{errors.emailMessage}</div> : null}
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label>Password</label>
                                        <input type="password" required placeholder="Password" {...bind("password")} />
                                        {errors.passwordMessage ? <div className="invalid-feedback">{errors.passwordMessage}</div> : null}
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label>Re-type Password</label>
                                        <input type="password" required placeholder="Password" {...bind("confirmPassword")} />
                                        {errors.confirmPasswordMessage ? <div className="invalid-feedback">{errors.confirmPasswordMessage}</div> : null}
                                    </div>

                                    <div className="col-md-12">
                                        <div className="form-group form-check">
                                            <label className="form-check-label" > <input type="checkbox" className="form-check-input" {...bindCheckBox("sendinvitation")} /> Send Invitation Email when submit</label>
                                        </div>
                                        <hr />
                                    </div>
                                    <div className="col-md-6">
                                        <label>Developers List</label>
                                        <DevelopersList onChange={setSelectedList} unauthorize={unauthorize} />
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
export default withRouter(connect(mapStateToProps)(SetupCustomer));
