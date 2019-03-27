// @ts-check

import get from 'lodash.get';
// eslint-disable-next-line no-unused-vars
import { $Values } from 'utility-types';

import Web3HttpProvider from 'web3-providers-http';

import Network from '@endpass/class/Network';

export default class ProviderFactory {
  /**
   * Creates requests provider
   * @param {$Values<Network.NET_ID>} activeNetId Network id
   * @returns {Web3HttpProvider}
   */
  static createRequestProvider(activeNetId = Network.NET_ID.MAIN) {
    const isExistInNetworkList = Object.values(Network.NET_ID).includes(
      activeNetId,
    );
    const netId = isExistInNetworkList ? activeNetId : Network.NET_ID.MAIN;
    const url = get(Network.NETWORK_URL_HTTP, `${netId}[0]`);

    return new Web3HttpProvider(url);
  }
}
