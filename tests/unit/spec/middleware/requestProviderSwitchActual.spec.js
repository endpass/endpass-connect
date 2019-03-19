import Web3HttpProvider from 'web3-providers-http';
import { Network } from '@endpass/class';
import requestProviderSwitchActual from '@/middleware/requestProviderSwitchActual';

jest.mock('web3-providers-http', () =>
  jest.fn(host => ({
    host,
  })),
);

describe('requestProviderCheck middleware', () => {
  const mainUrl = Network.NETWORK_URL_HTTP[Network.NET_ID.MAIN][0];
  const getRequestProvider = jest.fn().mockReturnValue({ host: mainUrl });
  const setRequestProvider = jest.fn();
  const context = {
    getRequestProvider,
    setRequestProvider,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const ropstenUrl = Network.NETWORK_URL_HTTP[Network.NET_ID.ROPSTEN][0];

  it('should set a new provider if the net id has been changed', () => {
    const item = {
      settings: { activeNet: Network.NET_ID.ROPSTEN },
    };

    requestProviderSwitchActual(context, item);

    const provider = new Web3HttpProvider(ropstenUrl);

    expect(setRequestProvider).toBeCalledWith(provider);
  });

  it(`should chain request if the net id hasn't been changed`, () => {
    const item = Object.freeze({
      settings: Object.freeze({ activeNet: Network.NET_ID.MAIN }),
    });

    const freezeContext = Object.freeze({ getRequestProvider });

    requestProviderSwitchActual(freezeContext, item);

    expect(setRequestProvider).not.toBeCalled();
  });
});
