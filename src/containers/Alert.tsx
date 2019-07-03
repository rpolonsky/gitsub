import React from 'react';
import { observer } from 'mobx-react';
import { useBaseStore } from '../stores';

import './Main.css';
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
      <div className="alert section">
        <div className="sectionTitle title">Warning!</div>
        {error}
        <button onClick={resetError}>OK</button>
      </div>
    </div>
  );
};

export default observer(Alert);
