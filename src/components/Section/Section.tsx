import React, { ReactElement } from 'react';
import cx from 'classnames';

import './Section.css';

type Props = {
  title?: string | ReactElement;
  className?: string;
  titleClassName?: string;
  children?: any;
};

const Section = (props: Props) => {
  const { className, titleClassName, title, children } = props;

  return (
    <div className={cx(className, 'section')}>
      {title && <div className={cx(titleClassName, 'sectionTitle')}>{title}</div>}
      {children}
    </div>
  );
};

export default Section;
