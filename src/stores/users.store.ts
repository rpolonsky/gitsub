import { observable, action, toJS } from 'mobx';
import localforage from 'localforage';
import axios from 'axios';

import MainStore from './main.store';
import { UserInfo, UserExtendedInfo } from '../types';
import { diffDays, sleepAsync } from '../utils';

type UsersExtendedInfo = { [login: string]: UserExtendedInfo };

interface Users {
  targets: number;
  extendedInfo: UsersExtendedInfo;
  currentTargets: { [login: string]: boolean };
  loading: boolean;
}

const MIN_TIMEOUT = 20;
const MAX_TIMEOUT = 500;
const MAX_SIMULTANEOUS_REQUESTS = 5;
const CACHE_LIFETIME_DAYS = 7;
const EXT_INFO_STORAGE_KEY = 'userExtendedInfo';
const GH_EXTENDED_INFO_URL_TEMPLATE = '/api/gh/users/%USERNAME%';

class UsersStore implements Users {
  private main: MainStore;

  @observable targets: number = 0;
  @observable extendedInfo: UsersExtendedInfo = {};
  @observable currentTargets: { [login: string]: boolean } = {};
  @observable loading = false;

  constructor(mainStore: MainStore) {
    this.main = mainStore;
  }
  @action getUsersExtendedInfo = (
    users: UserInfo[],
    username: string,
    token: string,
  ): Promise<UsersExtendedInfo> =>
    new Promise(async resolve => {
      const targets = [...users];
      this.targets = targets.length;

      if (!this.targets) {
        resolve(this.extendedInfo);
        return;
      }

      this.loading = true;

      const getInfo = async (currentTarget: UserInfo) => {
        const userInfo = await this.getUserExtendedInfo(currentTarget.login, username, token);
        this.targets--;

        if (userInfo) {
          this.extendedInfo[userInfo.login] = userInfo;
        }

        if (!this.targets) {
          this.storeUsersExtendedInfo(this.extendedInfo);
          this.loading = false;
          resolve(this.extendedInfo);
        }
      };

      for (let i = 0; i < targets.length; i++) {
        const requestCount = Object.values(this.currentTargets).filter(i => i).length;
        const currentTarget = targets[i];
        getInfo(currentTarget);
        await sleepAsync(requestCount >= MAX_SIMULTANEOUS_REQUESTS ? MAX_TIMEOUT : MIN_TIMEOUT);
      }
    });

  @action getUserExtendedInfo = async (
    targetUsername: string,
    username: string,
    token: string,
  ): Promise<UserExtendedInfo | null> => {
    try {
      this.currentTargets[targetUsername] = true;
      const stored =
        this.extendedInfo[targetUsername] || (await this.getStoredExtendedInfo(targetUsername));

      if (
        stored &&
        stored.stored_at &&
        diffDays(new Date(), new Date(stored.stored_at)) <= CACHE_LIFETIME_DAYS
      ) {
        this.currentTargets[targetUsername] = false;
        return stored;
      }

      const { headers, data } = await axios.get(
        GH_EXTENDED_INFO_URL_TEMPLATE.replace('%USERNAME%', targetUsername),
        {
          auth: {
            username,
            password: token,
          },
        },
      );
      gtag('event', 'get-user-extended-info', {
        event_category: 'users',
        event_value: targetUsername,
      });
      this.main.setRemainingRateLimit(headers);
      this.currentTargets[targetUsername] = false;

      return data;
    } catch (error) {
      console.error('error', error);
      this.main.setError(error.message ?? error);
      this.currentTargets[targetUsername] = false;
      return null;
    }
  };

  @action storeUsersExtendedInfo = async (users: UsersExtendedInfo) => {
    try {
      const rawData = await localforage.getItem(EXT_INFO_STORAGE_KEY);
      const storedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      const data: UsersExtendedInfo = storedData || {};

      Object.values(users).forEach(u => {
        u.stored_at = Date.now();
      });

      await localforage.setItem(
        EXT_INFO_STORAGE_KEY,
        toJS({ ...data, ...users }, { recurseEverything: true }),
      );
    } catch (error) {
      console.error('error', error);
      this.main.setError(error.message ?? error);
    }
  };

  @action getStoredExtendedInfo = async (
    username: string,
  ): Promise<UserExtendedInfo | undefined> => {
    try {
      const rawData = await localforage.getItem(EXT_INFO_STORAGE_KEY);
      const storedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      const data: UsersExtendedInfo = storedData || {};

      return data[username];
    } catch (error) {
      console.error('error', error);
      this.main.setError(error.message ?? error);
      return undefined;
    }
  };
}

export default UsersStore;
