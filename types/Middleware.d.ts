import Context from '@/class/Context/Context';
import { QueueAction } from '@/types/QueueAction';

type Middleware = (
  context: Context,
  action: QueueAction,
) => void;
