export function formatDateWithoutYear(date) {
  return (
      new Date(date).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
    })
  );
}

export function formatDate(date) {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export function formatPercentage(value) {
  let percentage = Number(value);
  percentage = Number.isInteger(percentage) ? percentage : percentage.toFixed(1);
  return !isNaN(percentage) ? `${percentage}%` : "";
}

export function percentageStatusClassName(percentage) {
  let result = "percentage-status";

  if (percentage <= 40) {
    result += " bad";
  } else if (percentage <= 70) {
    result += " okay";
  }  else {
    result += " good";
  }
  return result;
}

export function isWeekend(date) {
  const day = date.getDay();
  return (day === 0 || day === 6) ? true : false;
}

export function compareDates(date1, date2, operator) {
  date1 = new Date(date1).getTime();
  date2 = new Date(date2).getTime();

  if (operator === '<=') {
    return date1 <= date2;
  }
  if (operator === '>=') {
    return date1 >= date2;
  }
  if (operator === '<') {
    return date1 < date2;
  }
  if (operator === '>') {
    return date1 > date2;
  }
  if (operator === '===') {
    return date1 === date2;
  }
  return false;
}