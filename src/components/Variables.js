import React from 'react';

const Variables = ({ variables = {}, keyMap = {} }) => (
  <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
    {Object.keys(variables).map(varName => (<div>{keyMap[varName] || varName} : {variables[varName]}</div>))}
  </div>
);

export default Variables;