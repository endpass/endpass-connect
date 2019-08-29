import State from './State';

export default class StateOpen extends State {
  onClose() {
    this.widget.onClose();
  }
}
