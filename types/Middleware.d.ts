import Context from '@/class/Context/Context';
import { QueueAction } from '@/types/QueueAction';
import ProviderPlugin from '@/plugins/ProviderPlugin/ProviderPlugin';

declare type MiddlewareProps = {
  context: Context;
  action: QueueAction;
  providerPlugin: ProviderPlugin;
};

type Middleware = (props: MiddlewareProps) => void;
