import State from './State';

export default class StateOpen extends State {
  close() {
    this.dialogPlugin.hide();
  }
}
