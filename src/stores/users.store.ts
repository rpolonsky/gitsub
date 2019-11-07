import { observable, action } from 'mobx';
import localforage from 'localforage';
import axios from 'axios';

import MainStore from './main.store';
import { UserInfo, UserExtendedInfo } from '../types';
import { diffDays } from '../utils';

type UsersExtendedInfo = { [login: string]: UserExtendedInfo };

interface Users {
  extendedInfo: UsersExtendedInfo;
  currentTarget?: UserInfo;
  loading: boolean;
}

const TIMEOUT = 0;
const CACHE_LIFETIME_DAYS = 1;
const EXT_INFO_STORAGE_KEY = 'userExtendedInfo';
const GH_EXTENDED_INFO_URL_TEMPLATE = '/api/gh/users/%USERNAME%';

class UsersStore implements Users {
  private main: MainStore;

  @observable extendedInfo: UsersExtendedInfo = {};
  @observable currentTarget?: UserInfo = undefined;
  @observable loading = false;

  constructor(mainStore: MainStore) {
    this.main = mainStore;
  }
  @action getUsersExtendedInfo = async (users: UserInfo[], username: string, token: string) => {
    const targets = [...users];
    this.loading = true;

    const recursive = async () => {
      try {
        this.currentTarget = targets.shift();

        if (!this.currentTarget) {
          return;
        }

        const userInfo = await this.getUserExtendedInfo(this.currentTarget.login, username, token);

        if (userInfo) {
          this.extendedInfo[userInfo.login] = userInfo;
        }

        if (targets.length) {
          setTimeout(() => {
            recursive();
          }, TIMEOUT);
        } else {
          this.saveUsersExtendedInfo(this.extendedInfo);
          this.loading = false;
        }
      } catch (error) {
        console.error('error', error);
        this.main.setError(error.message ?? error);
        this.loading = false;
      }
    };
    recursive();
  };

  @action getUserExtendedInfo = async (
    targetUsername: string,
    username: string,
    token: string,
  ): Promise<UserExtendedInfo | null> => {
    try {
      const stored =
        this.extendedInfo[targetUsername] || (await this.getStoredExtendedInfo(targetUsername));

      if (
        stored &&
        stored.stored_at &&
        diffDays(new Date(), new Date(stored.stored_at)) <= CACHE_LIFETIME_DAYS
      ) {
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

      return data;
    } catch (error) {
      console.error('error', error);
      this.main.setError(error.message ?? error);
      return null;
    }
  };

  @action saveUsersExtendedInfo = async (users: UsersExtendedInfo) => {
    try {
      const dataString: string = await localforage.getItem(EXT_INFO_STORAGE_KEY);
      const data: UsersExtendedInfo = dataString ? JSON.parse(dataString) : {};

      Object.values(users).forEach(u => {
        u.stored_at = Date.now();
      });

      await localforage.setItem(EXT_INFO_STORAGE_KEY, JSON.stringify({ ...data, ...users }));
    } catch (error) {
      console.error('error', error);
      this.main.setError(error.message ?? error);
    }
  };

  @action getStoredExtendedInfo = async (
    username: string,
  ): Promise<UserExtendedInfo | undefined> => {
    try {
      const dataString: string = await localforage.getItem(EXT_INFO_STORAGE_KEY);
      const data: UsersExtendedInfo = dataString ? JSON.parse(dataString) : {};

      return data[username];
    } catch (error) {
      console.error('error', error);
      this.main.setError(error.message ?? error);
      return undefined;
    }
  };
}

export default UsersStore;
