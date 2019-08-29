import State from './State';

export default class StateClose extends State {
  onOpen(root) {
    this.widget.onOpen(root);
  }
}
