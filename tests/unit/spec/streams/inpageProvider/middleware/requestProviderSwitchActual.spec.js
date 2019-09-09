import Web3HttpProvider from 'web3-providers-http';
import Network from '@endpass/class/Network';
import requestProviderSwitchActual from '@/streams/inpageProvider/middleware/requestProviderSwitchActual';

jest.mock('web3-providers-http', () =>
  jest.fn(host => ({
    host,
  })),
);

describe('requestProviderCheck middleware', () => {
  const mainUrl = Network.NETWORK_URL_HTTP[Network.NET_ID.MAIN][0];
  const getRequestProvider = jest.fn().mockReturnValue({ host: mainUrl });
  const setRequestProvider = jest.fn();
  const providerPlugin = {
    getRequestProvider,
    setRequestProvider,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const ropstenUrl = Network.NETWORK_URL_HTTP[Network.NET_ID.ROPSTEN][0];

  it('should set a new provider if the net id has been changed', () => {
    const action = {
      settings: { activeNet: Network.NET_ID.ROPSTEN },
    };

    requestProviderSwitchActual({ providerPlugin, action });

    const provider = new Web3HttpProvider(ropstenUrl);

    expect(setRequestProvider).toBeCalledWith(provider);
  });

  it(`should chain request if the net id hasn't been changed`, () => {
    const action = Object.freeze({
      settings: Object.freeze({ activeNet: Network.NET_ID.MAIN }),
    });

    const freezePlugin = Object.freeze({ getRequestProvider });

    requestProviderSwitchActual({ providerPlugin: freezePlugin, action });

    expect(setRequestProvider).not.toBeCalled();
  });
});
