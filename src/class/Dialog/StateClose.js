import State from './State';

export default class StateOpen extends State {
  onOpen() {
    this.dialog.onOpen();
  }
}
