import get from 'lodash.get';

import Network from '@endpass/class/Network';
import ProviderFactory from '@/plugins/ProviderPlugin/ProviderFactory';

/** @type {import("@/types/Middleware").Middleware} */
const requestProviderSwitchActual = async ({ action, providerPlugin }) => {
  const { activeNet } = action.settings;
  const itemUrl = get(Network.NETWORK_URL_HTTP, `[${activeNet}][0]`);
  const { host } = providerPlugin.getRequestProvider();

  if (itemUrl === host) return;

  const provider = ProviderFactory.createRequestProvider(activeNet);

  providerPlugin.setRequestProvider(provider);
};

export default requestProviderSwitchActual;
