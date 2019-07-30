import { observable, action } from 'mobx';

interface Main {
  error: string;
  isMenuOpen: boolean;
  username: string;
  token: string;
}

class MainStore implements Main {
  @observable error = '';
  @observable isMenuOpen = false;
  @observable username = '';
  @observable token = '';

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
}

export default MainStore;
