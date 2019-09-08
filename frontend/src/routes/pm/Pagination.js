import React from "react";
import Pagination from 'react-bootstrap/Pagination';

export default function Paginations(props) {
  let listPages = getPaginationList(
    props.page || 1,
    props.nbrPages || 1,
    props.limitPages || 4
  );

  return (
    <Pagination>
      {listPages.map(elm => {
        switch (elm.type) {
          case "previous":
            return (
                <React.Fragment key={elm.key}>
                <Pagination.First disabled={elm.disabled} onClick={() => props.goToPage(1)} />
                <Pagination.Prev disabled={elm.disabled} onClick={() => !elm.disabled && props.goToPage(elm.page)} />
                </React.Fragment>
            );
          case "next":
            return (
                <React.Fragment key={elm.key}>
                <Pagination.Next disabled={elm.disabled} onClick={() => !elm.disabled && props.goToPage(elm.page)} />
                <Pagination.Last disabled={elm.disabled} onClick={() => !elm.disabled && props.goToPage(props.nbrPages)} />
                </React.Fragment>
            );
          case "suparator":
            return (
                <Pagination.Ellipsis key={elm.key}  onClick={() => !elm.disabled && props.goToPage(elm.page)}  />
            );
          case "page":
            return (
                <Pagination.Item key={elm.key} onClick={() => !elm.disabled && props.goToPage(elm.page)} active={elm.disabled} > {elm.page} </Pagination.Item>
            );
          default:
            return <div key={elm.key} />;
        }
      })}
    </Pagination>
  );
}

function getPaginationList(page, nbrPages, limitpages = 4) {
  if (nbrPages <= 1) return [];
  var list = [];
  list.push({
    type: "previous",
    key: 0,
    disabled: page === 1,
    page: page > 1 && page - 1
  });
  list.push({
    type: "page",
    page: 1,
    key: 1,
    active: page === 1,
    disabled: page === 1
  });
  if (page > limitpages + 2) list.push({ type: "suparator", key: -1 });
  for (
    var i = Math.max(2, page - limitpages);
    i <= Math.min(nbrPages - 1, page + limitpages);
    i++
  ) {
    list.push({
      type: "page",
      page: i,
      key: i,
      active: page === i,
      disabled: page === i
    });
  }
  if (page < nbrPages - limitpages - 1)
    list.push({ type: "suparator", key: -2 });
  list.push({
    type: "page",
    page: nbrPages,
    key: nbrPages,
    active: page === nbrPages,
    disabled: page === nbrPages
  });
  list.push({
    type: "next",
    key: nbrPages + 1,
    disabled: page === nbrPages,
    page: page < nbrPages && page + 1
  });
  return list;
}