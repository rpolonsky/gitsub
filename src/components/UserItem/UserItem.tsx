import React from 'react';
import cx from 'classnames';

import s from './UserItem.module.css';

type Props = {
  user: any;
  onClick?: VoidFunction;
  checked?: boolean;
  withCheckbox?: boolean;
  className?: string;
};

const UserItem = ({ user, onClick, className, checked, withCheckbox = false }: Props) => {
  return (
    <div className={cx(s.item, className, { unchecked: !checked })} onClick={onClick}>
      {withCheckbox && (
        <input type="checkbox" name={user.login} onChange={onClick} checked={checked} />
      )}
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
