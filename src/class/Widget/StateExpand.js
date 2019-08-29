import State from './State';

export default class StateExpand extends State {
  onCollapse() {
    this.widget.onCollapse();
  }
}
