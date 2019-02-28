import Web3HttpProvider from 'web3-providers-http';
import ProviderFactory from '@/class/ProviderFactory';
import { NETWORK_URL, NET_ID } from '@/constants';

jest.mock('web3-providers-http');

describe('ProviderFactory class', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mainUrl = NETWORK_URL.ETH[0];

  it('should create provider with main url by default', () => {
    const provider = ProviderFactory.createRequestProvider();

    expect(Web3HttpProvider).toBeCalledWith(mainUrl);
    expect(provider).toBeInstanceOf(Web3HttpProvider);
  });

  it('should return provider with net url which exist in net list', () => {
    const provider = ProviderFactory.createRequestProvider(NET_ID.ROPSTEN);

    expect(Web3HttpProvider).toBeCalledWith(NETWORK_URL.ROP[0]);
    expect(provider).toBeInstanceOf(Web3HttpProvider);
  });

  it('should return provider with main url which not exist in net list', () => {
    const provider = ProviderFactory.createRequestProvider(0);

    expect(Web3HttpProvider).toBeCalledWith(mainUrl);
    expect(provider).toBeInstanceOf(Web3HttpProvider);
  });
});
