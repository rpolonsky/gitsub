import { observable, action } from 'mobx';
import axios from 'axios';

import MainStore from './main.store';
import { UserInfo } from '../types';
import { sleepAsync } from '../utils';

interface Unsubscribe {
  targets: number;
  currentTargets: { [login: string]: boolean };
  page: number;
  processing: boolean;
}

const MIN_TIMEOUT = 20;
const MAX_TIMEOUT = 500;
const MAX_SIMULTANEOUS_REQUESTS = 5;
/* same as follow but requires different method */
const GH_UNFOLLOW_URL_TEMPLATE = '/api/gh/user/following/%USERNAME%';

class UnsubscribeStore implements Unsubscribe {
  private main: MainStore;

  @observable targets: number = 0;
  @observable currentTargets: { [login: string]: boolean } = {};
  @observable processing = false;
  @observable page = 1;

  constructor(mainStore: MainStore) {
    this.main = mainStore;
  }

  @action unfollowUsers = (users: UserInfo[], username: string, token: string) => {
    return new Promise(async (resolve, reject) => {
      const processed: string[] = [];
      const targets = [...users];
      this.targets = targets.length;
      this.processing = true;

      const unfollowUser = async (currentTarget: UserInfo) => {
        try {
          this.currentTargets[currentTarget.login] = true;
          const { headers } = await axios.delete(
            GH_UNFOLLOW_URL_TEMPLATE.replace('%USERNAME%', currentTarget.login),
            {
              auth: {
                username,
                password: token,
              },
            },
          );
          processed.push(currentTarget.login);
          this.targets--;
          gtag('event', 'unfollow-user', {
            event_category: 'unsubscribe',
            event_value: currentTarget.login,
          });
          this.main.setRemainingRateLimit(headers);
          currentTarget.processed = true;
          this.currentTargets[currentTarget.login] = false;

          if (!this.targets) {
            this.processing = false;
            resolve(processed);
          }
        } catch (error) {
          console.error('error', error);
          this.main.setError(error.message ?? error);
          this.currentTargets[currentTarget.login] = false;
          reject(error);
        }
      };

      for (let i = 0; i < targets.length; i++) {
        const requestCount = Object.values(this.currentTargets).filter(i => i).length;
        const currentTarget = targets[i];
        unfollowUser(currentTarget);
        await sleepAsync(requestCount >= MAX_SIMULTANEOUS_REQUESTS ? MAX_TIMEOUT : MIN_TIMEOUT);
      }
    });
  };
}

export default UnsubscribeStore;
