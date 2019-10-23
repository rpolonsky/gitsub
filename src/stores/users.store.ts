import { observable, action } from 'mobx';
import axios from 'axios';

import MainStore from './main.store';
import { UserInfo, UserExtendedInfo } from '../types';

interface Users {
  userInfoExtended: UserExtendedInfo[];
  currentTarget?: UserInfo;
  loading: boolean;
}

const TIMEOUT = 0;
const GH_EXTENDED_INFO_URL_TEMPLATE = '/api/gh/users/%USERNAME%';

class UsersStore implements Users {
  private main: MainStore;

  @observable userInfoExtended: UserExtendedInfo[] = [];
  @observable currentTarget?: UserInfo = undefined;
  @observable loading = false;

  constructor(mainStore: MainStore) {
    this.main = mainStore;
  }
  @action getUsersExtendedInfo = async (users: UserInfo[], username: string, token: string) => {
    const targets = [...users];

    const recursive = async () => {
      try {
        this.currentTarget = targets.shift();

        if (!this.currentTarget) {
          return;
        }

        const userInfo = await this.getUserExtendedInfo(this.currentTarget.login, username, token);

        if (userInfo) {
          this.userInfoExtended.push(userInfo);
        }

        if (targets.length) {
          setTimeout(() => {
            recursive();
          }, TIMEOUT);
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
      this.loading = true;
      //TODO: Check local storage
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

      //TODO: save to local storage
      this.loading = false;
      return data;
    } catch (error) {
      console.error('error', error);
      this.main.setError(error.message ?? error);

      this.loading = false;
      return null;
    }
  };
}

export default UsersStore;
