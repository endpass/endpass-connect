// @flow
import type Context from '../src/Context';
import type Queue from '../src/Queue';

declare type Middleware = (
  context: Context,
  item: QueueItem,
  queue: Queue,
) => void;
