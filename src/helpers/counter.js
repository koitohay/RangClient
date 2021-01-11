import React, { useEffect } from 'react';
import useGlobalCounter from './globalvar';

 export default function Counter(props) {
    const [state, setState] = useGlobalCounter();
    useEffect(() => {setState(state => state + 1)}, []);
    return (
      <div>
        <p>State: {state}</p>
        {/* <button onClick={useEffect(() => {setState(state => state + 1)}, [])}>+1</button> */}
      </div>
    )
}

export function Counter2(props) {
    const [state, setState] = useGlobalCounter();
    useEffect(() => {setState(state => state + 1)}, []);
    return (
      <div>
        <p>State: {state}</p>
        {/* <button onClick={useEffect(() => {setState(state => state + 1)}, [])}>+1</button> */}
      </div>
    )
}