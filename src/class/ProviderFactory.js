import get from 'lodash.get';

import Web3HttpProvider from 'web3-providers-http';
import { DEFAULT_NETWORKS, NET_ID } from '@/constants';

export default class ProviderFactory {
  /**
   * Creates requests provider
   * @param {String} activeNetId Network id
   * @returns {Web3HttpProvider}
   */
  static createRequestProvider(activeNetId = NET_ID.MAIN) {
    const isExistInNetworkList = Object.values(NET_ID).includes(activeNetId);
    const netId = isExistInNetworkList ? activeNetId : NET_ID.MAIN;
    const url = get(DEFAULT_NETWORKS, `${netId}.url[0]`);

    return new Web3HttpProvider(url);
  }
}
