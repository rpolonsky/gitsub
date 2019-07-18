import React, { ReactElement } from 'react';
import cx from 'classnames';

import s from './Section.module.css';

type Props = {
  title?: string | ReactElement;
  className?: string;
  titleClassName?: string;
  children?: any;
};

const Section = (props: Props) => {
  const { className, titleClassName, title, children } = props;

  return (
    <div className={cx(className, s.section)}>
      {title && <div className={cx(titleClassName, s.title)}>{title}</div>}
      {children}
    </div>
  );
};

export default Section;
