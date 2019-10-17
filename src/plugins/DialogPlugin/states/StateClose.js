import State from './State';

export default class StateOpen extends State {
  open() {
    this.dialogPlugin.show();
  }
}
