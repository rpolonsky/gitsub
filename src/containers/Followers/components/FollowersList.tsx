import React from 'react';

import Section from '../../../components/Section/Section';
import UserItem from '../../../components/UserItem/UserItem';

import { UserInfo } from '../../../types';

import s from '../Followers.module.css';

type Props = {
  followers: UserInfo[];
  loading: boolean;
};

const FollowersList = ({ followers, loading }: Props) => {
  return (
    <Section title={`list of ${followers.length || ''} followers`}>
      {!followers.length && !loading && 'yet empty...'}
      {loading && 'loading...'}

      {followers.map((user: any) => (
        <UserItem key={user.login} user={user} className={s.followerItem} />
      ))}
    </Section>
  );
};

export default FollowersList;
