import { observable, action } from 'mobx';

interface Main {
  error: string;
  isMenuOpen: boolean;
  username: string;
  token: string;
  remainingRateLimit?: RateLimit;
}

type RateLimit = {
  limit: string;
  remaining: string;
  resetDate: Date;
};

const getRateLimit = (headers: { [key: string]: string }): RateLimit => ({
  limit: headers['x-ratelimit-limit'],
  remaining: headers['x-ratelimit-remaining'],
  resetDate: new Date(+headers['x-ratelimit-reset'] * 1000),
});

class MainStore implements Main {
  @observable error = '';
  @observable isMenuOpen = false;
  @observable username = '';
  @observable token = '';
  @observable remainingRateLimit: RateLimit | undefined;

  /* error */
  @action resetError = () => {
    this.error = '';
  };
  @action setError = (error = '') => {
    this.error = error;
  };

  /* menu */
  @action toggleMenuState = () => {
    this.isMenuOpen = !this.isMenuOpen;
  };
  @action setMenuState = (state: boolean) => {
    this.isMenuOpen = state;
  };

  /* user credentials */
  @action setUsername = (username: string) => {
    this.username = username;
  };
  @action setToken = (token: string) => {
    this.token = token;
  };

  /* rate limits */
  @action setRemainingRateLimit = (headers: { [key: string]: string }) => {
    this.remainingRateLimit = getRateLimit(headers);
  };
}

export default MainStore;
