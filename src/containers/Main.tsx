import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { useBaseStore } from '../stores';

import './main.css';

const Main = () => {
  const [nickname, setNickname] = useState<string>('CurtisBerryman');
  const {
    main: { getUserFollowingList, following, loading },
  } = useBaseStore();

  return (
    <div>
      {loading ? (
        'Loading...'
      ) : (
        <>
          <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}></input>
          <button
            onClick={() => {
              getUserFollowingList(nickname);
            }}
          >
            Start
          </button>
        </>
      )}
      {following.map((user: any) => (
        <a href={user.followers_url} key={user.login} className="item">
          <img width={50} height={50} src={user.avatar_url} alt={user.login} />
          <div>Type: {user.type}</div>
          <div>Name: {user.login}</div>
        </a>
      ))}
    </div>
  );
};

export default observer(Main);
