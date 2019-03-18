import Web3HttpProvider from 'web3-providers-http';
import ProviderFactory from '@/class/ProviderFactory';
import { Network } from '@endpass/class';

jest.mock('web3-providers-http');

describe('ProviderFactory class', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mainUrl = Network.NETWORK_URL_HTTP[Network.NET_ID.MAIN][0];

  it('should create provider with main url by default', () => {
    const provider = ProviderFactory.createRequestProvider();

    expect(Web3HttpProvider).toBeCalledWith(mainUrl);
    expect(provider).toBeInstanceOf(Web3HttpProvider);
  });

  it('should return provider with net url which exist in net list', () => {
    const provider = ProviderFactory.createRequestProvider(Network.NET_ID.ROPSTEN);

    expect(Web3HttpProvider).toBeCalledWith(Network.NETWORK_URL_HTTP[Network.NET_ID.ROPSTEN][0]);
    expect(provider).toBeInstanceOf(Web3HttpProvider);
  });

  it('should return provider with main url which not exist in net list', () => {
    const provider = ProviderFactory.createRequestProvider(0);

    expect(Web3HttpProvider).toBeCalledWith(mainUrl);
    expect(provider).toBeInstanceOf(Web3HttpProvider);
  });
});
