import React from 'react';
import cx from 'classnames';

import s from './MenuButton.module.css';

type Props = {
  open?: boolean;
  onClick?: VoidFunction;
  className?: string;
};

const MenuButton = ({ open = false, onClick, className }: Props) => {
  return <div onClick={onClick} className={cx(s.main, className, { [s.open]: open })} />;
};

export default MenuButton;
