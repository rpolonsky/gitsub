import { createContext, useContext } from 'react';
import { configure } from "mobx"

import Main from './main.store';
import Subscribe from './subscribe.store';

configure({ enforceActions: "always" })

const main = new Main();

const BaseStore = {
  main,
  subscribe: new Subscribe(main),
};

export const rootContext = createContext(BaseStore);

export function useBaseStore() {
  return useContext(rootContext);
}

export default BaseStore;
