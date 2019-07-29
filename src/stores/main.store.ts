import { observable, action } from 'mobx';

interface Main {
  error: string;
  isMenuOpen: boolean;
}

class MainStore implements Main {
  @observable error = '';
  @observable isMenuOpen = false;

  @action resetError = () => {
    this.error = '';
  };
  @action setError = (error = '') => {
    this.error = error;
  };
  @action toggleMenuState = () => {
    this.isMenuOpen = !this.isMenuOpen;
  };
  @action setMenuState = (state: boolean) => {
    this.isMenuOpen = state;
  };
}

export default MainStore;
