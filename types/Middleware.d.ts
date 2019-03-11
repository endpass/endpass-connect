import Context from '@/Context';
import { QueueAction } from '@/types/QueueAction';

export type Middleware = (
  context: Context,
  action: QueueAction,
) => void;
