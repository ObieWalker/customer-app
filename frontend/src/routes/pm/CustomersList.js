import React, { useState, useEffect } from 'react';
import LeftMenu from '../../components/common/LeftMenu';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Paginations from './Pagination';
import axios from 'axios';
import routeNames from '../../constants/routeNames';
import { userLoggedOutAction } from '../../reducers/userActions';
import 'react-day-picker/lib/style.css';
import './CustomersList.css';
import { Link } from 'react-router-dom';


const CustomersList = props => {
    const [updateListValue, setUpdateList] = useState({ val: 1 });
    let [filter, setFilter] = useState({});
    let [data, setData] = useState({ list: [], loading: false, page: 1, itemPerPage: 10, nbrPages: 0 });
    const updateData = newData => {
        data = { ...data, ...newData };
        setData(data);
    };
    const updateList = () => setUpdateList({ val: updateListValue.val + 1 });
    const loadData = (dataFilter = {}) => {
        dataFilter = { ...filter, ...dataFilter };
        setFilter(dataFilter);
        const goToPage = page => {
            dataFilter.itemPerPage = data.itemPerPage;
            dataFilter.page = page;
            dataFilter.action = 'CustomersList';
            updateData({ page, loading: true });
            axios.post(routeNames.API_PM, dataFilter)
                .then(response => {
                    var res = response.data || {};
                    updateData({ page, loading: false, ...res });
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
        updateData({ list: [], loading: true, goToPage });
        goToPage(1);
    }
    useEffect(() => {
        if (props.role_type_id !== 2) {
            var action = userLoggedOutAction();
            props.dispatch(action);
            props.history.push(routeNames.LOGIN);
        } else {
            loadData(filter);
        }
    }, []);


    const resendInvitation = item => {
        return e => {
            item.loading = true;
            item.message = "Sending ...";
            axios.post(routeNames.API_PM, {
                action: "resendInvitation",
                id: item.id,
                email: item.email,
                name: item.name
            })
                .then(response => response.data)
                .then(response => {
                    if (response.success) {
                        item.message = "Invitation sent.";
                    } else {
                        item.message = "An error has occurred";
                    }
                    setTimeout(() => {
                        item.loading = false;
                        updateList();
                    }, 2000);
                    updateList();
                })
                .catch(_err => {

                });
            updateList();
        }
    }



    return (
        <div className='container fillHeightListDev'>
            <div className='row w-100 fillHeightListDev'>
                <div className='col-sm-12 col-md-3 fillHeightListDev'>
                    <LeftMenu />
                </div>
                <div className='col-sm-12 col-md-9 h-100 bg-white setupView'>
                    <div className='header'><h2>Welcome {props.full_name ? props.full_name : ' Customer!'}!</h2></div>
                    <div className='subTitle'><h3>List Customers</h3></div>

                    <div className="d-flex align-items-end">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Filter by name or email</label>
                            <input type="text" className="form-control" placeholder="Enter name or email"
                                onChange={e => setFilter({ ...filter, query: e.target.value })}
                                onKeyPress={({ key }) => key === 'Enter' ? loadData(filter) : null}
                            />
                        </div>
                        <button
                            type="button"
                            className="btn btn--dark mb-3 ml-2"
                            style={{ padding: '5px 15px' }}
                            onClick={e => loadData(filter)} >
                            Apply
                    </button>
                    </div>

                    <div className="tablecontainer">
                        {data.loading ? (
                            <div className="p-5 d-flex justify-content-center align-items-center spinnertable">
                                <div className="spinner-border" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        ) : null}
                        {data.nbrPages > 1 ? <div className='subTitle'><Paginations page={data.page} nbrPages={data.nbrPages} limitPages={5} goToPage={data.goToPage} /></div> : null}
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Email</th>
                                    <th scope="col" className="colaction"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.list.map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <Link to={routeNames.PM_CUSTOMER_UPDATE_MATCHED_DEVS.replace(':customerId', item.id)} >
                                                {item.name}
                                            </Link>
                                        </td>
                                        <td>{item.email}</td>
                                        <td className="colaction">
                                            {item.loading ? (item.message || "...") : <button className="btn-send-email" onClick={resendInvitation(item)} >Reset password and resend invitation</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!data.loading && !data.list.length) ? (
                            <div className="p-5 d-flex justify-content-center align-items-center">
                                Empty List
                            </div>
                        ) : null}
                    </div>
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

export default withRouter(connect(mapStateToProps)(CustomersList));
