import  createGlobalState from './globalvarlib';
// create the global for your hook
const initialState = 0

const [useGlobalCounter, Provider] = createGlobalState(initialState)

// export the provider to link in the application
export const GlobalCounterProvider = Provider

// export the hook
export default useGlobalCounter