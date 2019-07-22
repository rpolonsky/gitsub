import React, { PropsWithChildren } from 'react';

import s from './Layout.module.css';

type Props = PropsWithChildren<{}>;

const Layout = ({ children }: Props) => {
  return <div className={s.content}>{children}</div>;
};

export default Layout;
