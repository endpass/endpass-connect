import get from 'lodash.get';

import Network from '@endpass/class/Network';
import ProviderFactory from '@/class/ProviderFactory';
import { PLUGIN_METHODS } from '@/constants';

/** @type {import("@/types/Middleware").Middleware} */
const requestProviderSwitchActual = async (context, action) => {
  const { activeNet } = action.settings;
  const itemUrl = get(Network.NETWORK_URL_HTTP, `[${activeNet}][0]`);
  const { host } = context.getRequestProvider();

  if (itemUrl === host) return;

  const provider = ProviderFactory.createRequestProvider(activeNet);
  await context.handleRequest(
    PLUGIN_METHODS.CONTEXT_SET_REQUEST_PROVIDER,
    provider,
  );
};

export default requestProviderSwitchActual;
