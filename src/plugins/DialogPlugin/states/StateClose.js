import State from './State';

export default class StateOpen extends State {
  open() {
    this.dialogView.open();
  }
}
