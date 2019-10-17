import { observable, action } from 'mobx';
import axios from 'axios';

import MainStore from './main.store';

interface Unsubscribe {
  targets: any[];
  currentTarget: any;
  page: number;
  loading: boolean;
  processing: boolean;
}

const TIMEOUT = 0;
/* same as follow but requires different method */
const GH_UNFOLLOW_URL_TEMPLATE = '/api/gh/user/following/%USERNAME%';

class UnsubscribeStore implements Unsubscribe {
  private main: MainStore;

  @observable targets: any[] = [];
  @observable currentTarget: any = null;
  @observable loading = false;
  @observable processing = false;
  @observable page = 1;

  constructor(mainStore: MainStore) {
    this.main = mainStore;
  }

  @action unfollowUsers = (users: any[], username: string, token: string) => {
    this.processing = true;
    this.targets = [...users];

    const recursive = async () => {
      try {
        this.currentTarget = this.targets.shift();

        if (!this.currentTarget) {
          return;
        }

        const { headers } = await axios.delete(
          GH_UNFOLLOW_URL_TEMPLATE.replace('%USERNAME%', this.currentTarget.login),
          {
            auth: {
              username,
              password: token,
            },
          },
        );
        gtag('event', 'unfollow-user', {
          event_category: 'unsubscribe',
          event_value: this.currentTarget.login,
        });

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

export default UnsubscribeStore;
