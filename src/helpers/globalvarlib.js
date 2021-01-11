import React, { useState, useContext, createContext } from 'react'

export default function createGlobalState(initialState) {
  const Context = createContext()

  const Provider = function ContextProvider(props) {
    const [state, setState] = useState(initialState)

    const ctxValue = [
      state,
      newState => setState(newState)
    ]

    return (
      <Context.Provider value={ctxValue}>
        {props.children}
      </Context.Provider>
    )
  }

  return [
    () => useContext(Context),
    Provider
  ]
}