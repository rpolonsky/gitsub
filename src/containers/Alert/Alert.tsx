import React from 'react';
import { observer } from 'mobx-react';

import { useBaseStore } from '../../stores';
import Section from '../../components/Section/Section';

import './Alert.css';

const Alert = () => {
  const {
    main: { error, resetError },
  } = useBaseStore();

  if (!error) {
    return null;
  }
  return (
    <div className="overlay" onClick={resetError}>
      <Section title="Warning!" titleClassName="title" className="alert">
        {error}
        <button onClick={resetError}>OK</button>
      </Section>
    </div>
  );
};

export default observer(Alert);
