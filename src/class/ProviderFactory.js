// @ts-check

import get from 'lodash.get';
// eslint-disable-next-line no-unused-vars
import { $Values } from 'utility-types';

import Web3HttpProvider from 'web3-providers-http';

import { DEFAULT_NETWORKS, NET_ID } from '@/constants';

export default class ProviderFactory {
  /**
   * Creates requests provider
   * @param {$Values<typeof NET_ID>} activeNetId Network id
   * @returns {Web3HttpProvider}
   */
  static createRequestProvider(activeNetId = NET_ID.MAIN) {
    const isExistInNetworkList = Object.values(NET_ID).includes(activeNetId);
    const netId = isExistInNetworkList ? activeNetId : NET_ID.MAIN;
    const url = get(DEFAULT_NETWORKS, `${netId}.url[0]`);

    return new Web3HttpProvider(url);
  }
}
