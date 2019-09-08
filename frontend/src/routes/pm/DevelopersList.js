import React, { useEffect, useState } from 'react'
import Paginations from './Pagination';
import axios from 'axios';
import routeNames from '../../constants/routeNames';
import { withRouter } from 'react-router';
import { userLoggedOutAction } from '../../reducers/userActions';

function DevelopersList(props) {
    var [filter, setFilter] = useState({});
    var [autoCompleteList, setAutoCompleteList] = useState({ loading: false, list: [] });
    var [selectedList, setSelectedList] = useState([]);
    var [data, setData] = useState({ list: [], loading: false, page: 1, itemPerPage: 10, nbrPages: 0 });
    useEffect(() => {
        if (props.events) {
            props.events.updateSelectedList = list => {
                setTimeout(() => {
                    selectedList = (list || []).map(initItem);
                    setSelectedList(selectedList);
                    data.list = data.list.map(item => {
                        item.checked = list.some(elm => elm.id === item.id);
                        return item;
                    });
                    updateData({ list: data.list });
                    if (props.onChange) props.onChange(selectedList.map(initItem));
                }, 50)


            }
        }
    }, [!!props.events]);

    const updateData = newData => {
        data = { ...data, ...newData };
        setData(data);
    };
    var self = this;

    const loadData = (dataFilter = {}) => {
        dataFilter = { ...filter, ...dataFilter };
        setFilter(dataFilter);
        const goToPage = page => {
            dataFilter.itemPerPage = data.itemPerPage;
            dataFilter.page = page;
            dataFilter.action = 'DevelopersList';
            updateData({ page, loading: true });
            axios.post(routeNames.API_PM, dataFilter)
                .then(response => {
                    var res = response.data || {};
                    res.list = res.list.map(initItem);
                    updateData({ page, loading: false, ...res });
                })
                .catch(_err => {
                  if (_err && _err.response && _err.response.status === 401) {
                    props.unauthorize();
                    return;
                  }
                });
        }
        updateData({ list: [], loading: true, goToPage });
        goToPage(1);
    }
    useEffect(() => loadData(filter), []);
    const initItem = (item) => {
        item.checked = selectedList.some(elm => elm.id === item.id);
        item.uncheck = () => {
            selectedList = selectedList.filter(elm => elm.id !== item.id);
            setSelectedList(selectedList);
            if (props.onChange) props.onChange(selectedList.map(initItem));
            data.list = data.list.map(initItem);
            updateData({ list: data.list });
        }
        return item;
    }

    const bindCheckBox = item => {
        return {
            checked: item.checked,
            onChange: e => {
                item.checked = e.target.checked;
                if (item.checked) {
                    selectedList = [...selectedList, item];
                } else {
                    selectedList = selectedList.filter(elm => elm.id !== item.id);
                }
                setSelectedList(selectedList);
                if (props.onChange) props.onChange(selectedList.map(initItem));
            }
        }
    }


    useEffect(() => {
        if (window.timeAutoComplete) clearTimeout(window.timeAutoComplete);
        if (filter.query && filter.query.length > 2) {
            window.timeAutoComplete = setTimeout(() => loadData(filter), 500);
        }
    }, [filter.query]);

    const HandleKeyPress = e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (window.timeAutoComplete) clearTimeout(window.timeAutoComplete);
            loadData(filter);
        }
    }



    return (
        <div style={{ zoom: "0.7" }}>
            <div className="d-flex align-items-end">
                <div className="form-group position-relative" style={{ flex: 1 }}>
                    <label>Filter by name or email</label>
                    <input list="datalist" type="text" className="form-control" placeholder="Enter name or email"
                        onChange={e => setFilter({ ...filter, query: e.target.value })}
                        onKeyPress={HandleKeyPress}
                    />
                </div>
            </div>

            <div className="tablecontainer">
                {data.loading ? (
                    <div className="p-5 d-flex justify-content-center align-items-center spinnertable">
                        <div className="spinner-border" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                ) : null}
                <div style={{ border: '1px solid #ccc' }}>
                    <table className="table table-striped" style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th scope="col">Name</th>
                                <th scope="col">Email</th>
                                <th scope="col" className="colaction"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.list.map(item => (
                                <tr key={item.id} className={item.checked ? 'table-success' : ''}>
                                    <td><b>{item.name}</b></td>
                                    <td><b>{item.email}</b></td>
                                    <td className="colaction" style={{ padding: 0 }}>
                                        <input type="checkbox" style={{ zoom: 2, margin: 5, cursor: 'pointer' }} {...bindCheckBox(item)} />
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
                {data.nbrPages > 1 ? <div className='subTitle' style={{ zoom: "0.9" }} ><Paginations page={data.page} nbrPages={data.nbrPages} limitPages={2} goToPage={data.goToPage} /></div> : null}
            </div>
        </div>
    )
}

export default withRouter(DevelopersList);
