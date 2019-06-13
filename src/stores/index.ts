import { createContext, useContext } from 'react';
import Main from './main.store';

const BaseStore = {
  main: Main,
};

export const rootContext = createContext(BaseStore);

export function useBaseStore() {
  return useContext(rootContext);
}

export default BaseStore;
