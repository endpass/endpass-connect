import Web3HttpProvider from 'web3-providers-http';
import requestProviderSwitchActual from '@/middleware/requestProviderSwitchActual';
import { NETWORK_URL, NET_ID } from '@/constants';

jest.mock('web3-providers-http', () =>
  jest.fn(host => ({
    host,
  })),
);

describe('requestProviderCheck middleware', () => {
  const mainUrl = NETWORK_URL.ETH[0];
  const getRequestProvider = jest.fn().mockReturnValue({ host: mainUrl });
  const setRequestProvider = jest.fn();
  const context = {
    getRequestProvider,
    setRequestProvider,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const ropstenUrl = NETWORK_URL.ROP[0];

  it('should set a new provider if the net id has been changed', () => {
    const item = {
      settings: { activeNet: NET_ID.ROPSTEN },
    };

    requestProviderSwitchActual(context, item);

    const provider = new Web3HttpProvider(ropstenUrl);

    expect(setRequestProvider).toBeCalledWith(provider);
  });

  it(`should chain request if the net id hasn't been changed`, () => {
    const item = Object.freeze({
      settings: Object.freeze({ activeNet: NET_ID.MAIN }),
    });

    const freezeContext = Object.freeze({ getRequestProvider });

    requestProviderSwitchActual(freezeContext, item);

    expect(setRequestProvider).not.toBeCalled();
  });
});
