import React, { useState } from 'react';
import cx from 'classnames';

import Section from '../../../components/Section/Section';
import UserItem from '../../../components/UserItem/UserItem';

import { FollowersDiff } from '../../../types';

import s from '../Followers.module.css';

type Props = {
  followersDiff: FollowersDiff | null;
  targetUsername: string;
};

const FollowersListChanges = ({ followersDiff, targetUsername }: Props) => {
  const [showChanges, setShowChanges] = useState<boolean>(false);

  if (!followersDiff) {
    return (
      <Section title="changes in followers list">
        <div className={s.row}>
          No previous snapshots found for {targetUsername || 'that user'}.
        </div>
        <div className={s.row}>Use button "Save followers snapshot" to store snapshots.</div>
        <div className={s.row}>Then you may compare current followers list with the last one.</div>
        <div className={s.row}>
          Snapshots aren't saved on the server. Everything is stored only on your device.
        </div>
      </Section>
    );
  }

  const hasChanges = !!(followersDiff.gained.length || followersDiff.lost.length);

  return (
    <Section title="changes in followers list">
      {hasChanges && (
        <button onClick={() => setShowChanges(!showChanges)}>
          {!showChanges ? 'Show changes since last snapshot' : 'Hide changes'}
        </button>
      )}

      {!hasChanges && 'No changes since last snapshot'}

      {showChanges && (
        <div className={s.changeList}>
          {!!followersDiff.gained.length && (
            <>
              new followers:
              <div>
                {followersDiff.gained.map(follower => (
                  <UserItem
                    user={follower}
                    key={follower.id}
                    className={cx(s.followerItem, s.newFollowerItem)}
                  />
                ))}
              </div>
            </>
          )}
          {!!followersDiff.lost.length && (
            <>
              unfollowers:
              <div>
                {followersDiff.lost.map(follower => (
                  <UserItem
                    user={follower}
                    key={follower.id}
                    className={cx(s.followerItem, s.unfollowerItem)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </Section>
  );
};

export default FollowersListChanges;
