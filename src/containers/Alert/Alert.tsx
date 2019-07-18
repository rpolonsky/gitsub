import React from 'react';
import { observer } from 'mobx-react';

import { useBaseStore } from '../../stores';
import Section from '../../components/Section/Section';

import s from './Alert.module.css';

const Alert = () => {
  const {
    main: { error, resetError },
  } = useBaseStore();

  if (!error) {
    return null;
  }
  return (
    <div className={s.overlay} onClick={resetError}>
      <Section title="Warning!" titleClassName={s.title} className={s.alert}>
        {error}
        <button onClick={resetError}>OK</button>
      </Section>
    </div>
  );
};

export default observer(Alert);
