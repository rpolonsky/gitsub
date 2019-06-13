import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import { useBaseStore } from '../stores';

import './main.css';

const Main = () => {
  const {
    main: { getUsers, users },
  } = useBaseStore();

  console.log('users', users.length); /* TODO: Remove */

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div>
      {users.map((user: any) => (
        <div key={user.name} className="item">
          <img src={user.image} alt={user.name} />
          <div>Name: {user.name}</div>
          <div>Nick: {user.nickname}</div>
        </div>
      ))}
    </div>
  );
};

export default observer(Main);
