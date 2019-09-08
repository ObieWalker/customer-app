
function formartFeedbackRateResult(result) {
  let temp = {};
  // sort from smallest rate to largest rate
  // then reduce into array of {rate, numberOfRate}
  return result
    .sort((first, second) => first.rate - second.rate)
    .reduce((accumulator, currentValue, index, array) => {
      if (temp.rate === currentValue.rate) {
        temp.numberOfRate += currentValue.numberOfRate;
      } else {
        if (temp.rate) accumulator.push(temp);
        temp = { ...currentValue };
      }
      if (index === array.length - 1) accumulator.push(temp);
      return accumulator;
    }, []);
};

module.exports = {
  formartFeedbackRateResult
};
