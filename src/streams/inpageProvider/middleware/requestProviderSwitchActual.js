import get from 'lodash.get';

import Network from '@endpass/class/Network';
import ProviderFactory from '@/class/ProviderFactory';

/** @type {import("@/types/Middleware").Middleware} */
const requestProviderSwitchActual = async (context, action) => {
  const { activeNet } = action.settings;
  const itemUrl = get(Network.NETWORK_URL_HTTP, `[${activeNet}][0]`);
  const { host } = context.getRequestProvider();

  if (itemUrl === host) return;

  const provider = ProviderFactory.createRequestProvider(activeNet);
  context.setRequestProvider(provider);
};

export default requestProviderSwitchActual;
