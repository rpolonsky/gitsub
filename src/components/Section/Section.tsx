import React, { ReactElement, PropsWithChildren } from 'react';
import cx from 'classnames';

import s from './Section.module.css';

type Props = PropsWithChildren<{
  title?: string | ReactElement;
  className?: string;
  titleClassName?: string;
  onClick?: VoidFunction;
}>;

const Section = (props: Props) => {
  const { className, titleClassName, title, children, onClick } = props;

  return (
    <div className={cx(className, s.section)} onClick={onClick}>
      {title && <div className={cx(titleClassName, s.title)}>{title}</div>}
      {children}
    </div>
  );
};

export default Section;
