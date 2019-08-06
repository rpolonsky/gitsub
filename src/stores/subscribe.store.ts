import { observable, action } from 'mobx';
import axios from 'axios';

import MainStore from './main.store';

interface Subscribe {
  following: any[];
  targets: any[];
  currentTarget: any;
  page: number;
  loading: boolean;
  processing: boolean;
}

const TIMEOUT = 0;
const MAX_PAGE_LIMIT = 0;
const GH_FOLLOWING_URL_TEMPLATE = '/api/gh/users/%USERNAME%/following?page=%PAGE%';
const GH_FOLLOW_URL_TEMPLATE = '/api/gh/user/following/%USERNAME%';

class SubscribeStore implements Subscribe {
  private main: MainStore;

  @observable following: any[] = [];
  @observable targets: any[] = [];
  @observable currentTarget: any = null;
  @observable loading = false;
  @observable processing = false;
  @observable page = 1;

  constructor(mainStore: MainStore) {
    this.main = mainStore;
  }

  @action getUserFollowingList = (targetUser: string, username: string, token: string) => {
    try {
      this.loading = true;
      this.page = 1;
      this.following = [];

      const recursive = async () => {
        const result = await axios.get(
          GH_FOLLOWING_URL_TEMPLATE.replace('%USERNAME%', targetUser).replace(
            '%PAGE%',
            String(this.page),
          ),
          {
            auth: {
              username,
              password: token,
            },
          },
        );

        if (result?.data?.length) {
          this.following.push(...result.data);
        }

        this.main.setRemainingRateLimit(result.headers);

        if (result?.data?.length && (!MAX_PAGE_LIMIT || this.page < MAX_PAGE_LIMIT)) {
          this.page++;
          setTimeout(() => recursive(), TIMEOUT);
        } else {
          this.loading = false;
        }
      };

      recursive();
    } catch (error) {
      console.error('error', error);
      this.main.setError(error.message ?? error);
      this.following = [];
      this.loading = false;
    }
  };
  @action followUsers = (users: any[], username: string, token: string) => {
    this.processing = true;
    this.targets = [...users];

    const recursive = async () => {
      try {
        this.currentTarget = this.targets.shift();

        if (!this.currentTarget) {
          return;
        }

        const { headers } = await axios.put(
          GH_FOLLOW_URL_TEMPLATE.replace('%USERNAME%', this.currentTarget.login),
          {},
          {
            auth: {
              username,
              password: token,
            },
          },
        );

        this.main.setRemainingRateLimit(headers);
        this.currentTarget.processed = true;

        if (this.targets.length) {
          setTimeout(() => {
            recursive();
          }, TIMEOUT);
        } else {
          this.processing = false;
        }
      } catch (error) {
        console.error('error', error);
        this.main.setError(error.message ?? error);
        this.processing = false;
      }
    };
    recursive();
  };
}

export default SubscribeStore;
