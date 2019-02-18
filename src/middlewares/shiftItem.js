import itemStates from '@/Queue/itemStates';

export default function(context, item, queue) {
  if (item.state !== itemStates.REPEAT) {
    queue.shift();
  }
}
