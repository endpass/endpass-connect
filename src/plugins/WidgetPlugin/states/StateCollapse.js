import State from './State';

export default class StateCollapse extends State {
  onExpand() {
    this.widget.onExpand();
  }
}
