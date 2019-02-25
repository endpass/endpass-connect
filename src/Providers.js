import get from 'lodash.get';

import createInpageProvider from '@/util/createInpageProvider';
import { DEFAULT_NETWORKS } from '@/constants';

export default class Providers {
  /**
   * @param {Context} context instance of connect
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * Creates requests provider and save it to the instance property
   * @private
   * @param {Web3.Provider} Provider Web3 provider class
   */
  createRequestProvider(Provider) {
    const { context } = this;
    const { activeNet } = context.getInpageProviderSettings();

    const url = get(DEFAULT_NETWORKS, `${activeNet}.url[0]`);

    const reqProvider = new Provider(url);
    context.setRequestProvider(reqProvider);
  }

  // TODO: Not ready yet (>= web3 1.0.0-beta.40 support)
  /**
   * Create InpageProvider
   * @param {Web3.Provider} provider Web3-friendly provider
   * @param {url} url for provider
   */
  createInpageProvider(provider) {
    const { context } = this;
    const { activeNet } = context.getInpageProviderSettings();
    const url = get(DEFAULT_NETWORKS, `${activeNet}.url[0]`);

    const instance = createInpageProvider({
      emitter: this.getEmitter(),
      url,
      provider,
    });
    context.setInpageProvider(instance);
  }
}
