import React from 'react';
import cx from 'classnames';

import s from './UserItem.module.css';

type Props = {
  user: any;
  onClick: VoidFunction;
  checked: boolean;
};

const UserItem = ({ user, onClick, checked }: Props) => {
  return (
    <div className={cx(s.item, { unselected: !checked })} onClick={onClick}>
      <input type="checkbox" name={user.login} onChange={onClick} checked={checked} />
      <img src={user.avatar_url} alt={user.login} />
      <div className={s.name}>
        <a
          href={`https://github.com/${user.login}`}
          onClick={e => e.stopPropagation()}
          target="_blank"
          rel="noopener noreferrer"
        >
          {user.login}
        </a>
      </div>
      {user.processed && 'processed'}
    </div>
  );
};

export default UserItem;
