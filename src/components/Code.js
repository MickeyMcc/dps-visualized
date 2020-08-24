import React from 'react';

const CodeDisplay = ({ code, currentLine, highlight }) => (
  <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
    {code.map((line, i) => (<div style={{ color: currentLine === i && highlight ? 'black': 'gray'}}>{line}</div>))}
  </div>
);


export default CodeDisplay;