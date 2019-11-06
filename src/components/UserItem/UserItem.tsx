import React from 'react';
import cx from 'classnames';

import { UserInfo, UserExtendedInfo } from '../../types';

import s from './UserItem.module.css';

type Props = {
  user: UserInfo;
  extended?: UserExtendedInfo;
  onClick?: VoidFunction;
  checked?: boolean;
  withCheckbox?: boolean;
  className?: string;
};

const UserItem = ({ user, onClick, extended, className, checked, withCheckbox = false }: Props) => {
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
      <div className={s.stats}>
        {extended && (
          <>
            <span>followed:{extended.followers}</span>
            <span>follows:{extended.following}</span>
            <span>gists:{extended.public_gists}</span>
            <span>visited:{new Date(extended.updated_at).toLocaleDateString()}</span>
          </>
        )}
      </div>
      <div className={s.state}>{user.processed && '✓'}</div>
    </div>
  );
};

export default UserItem;
