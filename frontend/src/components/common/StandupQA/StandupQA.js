import React from 'react';

function StandupQA({ question, answer }) {
  return (
    <div className="mb-5">
      <h5 className="mb-3">{question}</h5>
      <div style={{color: '#888888'}}>{answer}</div>
    </div>
  );
}

export default StandupQA;
