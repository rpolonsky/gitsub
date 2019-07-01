import { observable, action } from 'mobx';
import axios from 'axios';

interface Main {
  following: any[];
  targets: any[];
  currentTarget: any;
  page: number;
  error: string;
  loading: boolean;
  processing: boolean;
  remainingRateLimit?: string;
}

const TIMEOUT = 0;
const MAX_PAGE_LIMIT = 0;
const GH_FOLLOWING_URL_TEMPLATE = '/api/gh/users/%USERNAME%/following?page=%PAGE%';
const GH_FOLLOW_URL_TEMPLATE = '/api/gh/user/following/%USERNAME%';

class MainStore implements Main {
  @observable following: any[] = [];
  @observable targets: any[] = [];
  @observable currentTarget: any = null;
  @observable remainingRateLimit: string | undefined;
  @observable loading = false;
  @observable processing = false;
  @observable page = 1;
  @observable error = '';

  @action getUserFollowingList = (targetUser: string, username: string, token: string) => {
    try {
      this.loading = true;

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

        this.remainingRateLimit = `${result.headers['x-ratelimit-remaining']} of ${
          result.headers['x-ratelimit-limit']
        } till ${new Date(result.headers['x-ratelimit-reset'] * 1000)}`;

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
      this.error = error;
      this.following = [];
      this.loading = false;
    }
  };

  @action followUsers = (users: any[], username: string, token: string) => {
    try {
      this.processing = true;
      this.targets = [...users];

      const recursive = async () => {
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

        this.remainingRateLimit = `${headers['x-ratelimit-remaining']} of ${
          headers['x-ratelimit-limit']
        } till ${new Date(headers['x-ratelimit-reset'] * 1000)}`;

        if (this.targets.length) {
          setTimeout(() => {
            recursive();
          }, TIMEOUT);
        } else {
          this.processing = false;
        }
      };
      recursive();
    } catch (error) {
      console.error('error', error);
      this.error = error;
      this.processing = false;
    }
  };
}

export default new MainStore();
