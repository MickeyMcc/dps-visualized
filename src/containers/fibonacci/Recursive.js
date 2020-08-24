import { Map, List } from 'immutable';
import JSONPretty from 'react-json-pretty';
import React, { useReducer, useEffect, useState } from 'react';

import Code from '../../components/Code';
import Variables from '../../components/Variables'

const stateMachine = (state) => {
  console.log('state', state);
  const { currentIteration, callStack } = state;
  const { variables, currentLine } = currentIteration;
  const { n } = variables;
  let nextState = Map({ currentIteration, callStack: List(callStack) });
  switch (currentLine) {
    case 0:       // 'const method = (n) => {'
      return nextState.setIn(['currentIteration', 'currentLine'], 1).toJS();
    case 1:       // '  if (n === 0) {',
      if (n === 0) {
        return nextState.setIn(['currentIteration', 'currentLine'], 2).toJS();
      }
      return nextState.setIn(['currentIteration', 'currentLine'], 3).toJS();
    case 2:       // '    return 0;'
      if (callStack.length) {
        const lastIteration = callStack.pop();
        if (lastIteration.variables.n1 === undefined) {
          lastIteration.variables.n1 = 0;
        } else if (lastIteration.variables.n2 === undefined) {
          lastIteration.variables.n2 = 0;
        }
        return nextState.set('currentIteration', Map(lastIteration)).toJS();
      }
      return nextState.set('finalReturn', 0).toJS();
    case 3:       // '  }'
      return nextState.setIn(['currentIteration', 'currentLine'], 4).toJS();
    case 4:       // '  if (n === 1) {'
      if (n === 1) {
        return nextState.setIn(['currentIteration', 'currentLine'], 5).toJS();
      }
      return nextState.setIn(['currentIteration', 'currentLine'], 6).toJS();
    case 5:       // '    return 1;'
      if (callStack.length) {
        const lastIteration = callStack.pop();
        if (lastIteration.variables.n1 === undefined) {
          lastIteration.variables.n1 = 1;
        } else if (lastIteration.variables.n2 === undefined) {
          lastIteration.variables.n2 = 1;
        }
        return nextState.set('currentIteration', Map(lastIteration)).toJS();
      }
      return nextState.set('finalReturn', 1).toJS();
    case 6:       // '  }'
      return nextState.setIn(['currentIteration', 'currentLine'], 7).toJS();
    case 7:       // '  return method(n - 1) + method(n - 2);'
      if (variables.n1 === undefined) {
        // put in callStack
        console.log('here', { currentIteration: { variables: { n: variables.n - 1 }, currentLine: 0 }, callStack: callStack.concat([currentIteration])})
        return { currentIteration: { variables: { n: variables.n - 1 }, currentLine: 0 }, callStack: callStack.concat([currentIteration])};
      } else if (variables.n2 === undefined) {
        return { currentIteration: { variables: { n: variables.n - 2 }, currentLine: 0 }, callStack: callStack.concat([currentIteration])};
      } else {
        if (callStack.length) {
          const lastIteration = callStack.pop();
          if (lastIteration.variables.n1 === undefined) {
            lastIteration.variables.n1 = variables.n1 + variables.n2;
          } else if (lastIteration.variables.n2 === undefined) {
            lastIteration.variables.n2 = variables.n1 + variables.n2;
          }
          nextState = nextState.set('currentIteration', Map(lastIteration));
          return nextState.set('callStack', callStack).toJS();
        }
        nextState = nextState.setIn(['currentIteration', 'currentLine'], -1);
        return nextState.set('finalReturn', variables.n1 + variables.n2).toJS();
      }
    case -1:
      console.log('END')
      return nextState.toJS();
  }
}

const reducer = (appState, { type, params }) => {
  switch (type) {
    case 'NEXT':
      return stateMachine(appState);
    default:
      return appState;
  }
}

const FibonacciRecursive = () => {
  const [iterations, setIterations] = useState([]);
  const [runtime, dispatch] = useReducer(reducer, {
    currentIteration: { variables: { n: 5 }, currentLine: 0 },
    callStack: [],
  })
  const [go, setGo] = useState(false);

  useEffect(() => {
    iterations[0] = runtime;
    if (!runtime.finalReturn && go) {
      dispatch({ type: 'NEXT' })
    }
    if (runtime.finalReturn) {
      setGo(false)
    }
  }, [runtime, go])


  // recursive fibonacci method
  const method = (n) => {
    if (n === 0) {
      return 0
    }
    if (n === 1) {
      return 1
    }
    return method(n-1) + method(n-2);
  }

  const text = [
    'const method = (n) => {',                  // 0
    '  if (n === 0) {',                         // 1
    '    return 0;',                            // 2
    '  }',                                      // 3
    '  if (n === 1) {',                         // 4
    '    return 1;',                            // 5
    '  }',                                      // 6
    '  return method(n - 1) + method(n - 2);',  // 7
  ];

  const letsGo = () => {
    setGo(true);
  }

  const advance = () => {
    dispatch({ type: 'NEXT' });
  }

  return (
    <div style={{ width: '100%' }}>
      <button enabled={!advance} onClick={advance}>advance</button>
      <button enabled={!go} onClick={letsGo}>Go</button>
      <div style={{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
        <Variables variables={runtime && runtime.currentIteration && runtime.currentIteration.variables} keyMap={{ n1: 'method(n - 1)', n2: 'method(n - 2)' }} />
        <Code code={text} highlight={true} currentLine={runtime && runtime.currentIteration && runtime.currentIteration.currentLine} />
      </div>
      {iterations.map((data) => <JSONPretty id="json-pretty" data={data}></JSONPretty>)}
    </div>
  );
};

export default FibonacciRecursive;