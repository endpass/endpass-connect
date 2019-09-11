import OauthPlugin from '@/plugins/OauthPlugin';

describe('OauthPlugin plugin', () => {
  const oauthClientId = 'xxxxxxxxxx';

  const options = {widget: false};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throw error without apiKey', () => {
    expect(() => new OauthPlugin()).toThrow();
    expect(() => new OauthPlugin(options)).toThrow();
    expect(
      () => new OauthPlugin({ oauthClientId: undefined, ...options }),
    ).toThrow();
    expect(
      () => new OauthPlugin({ oauthClientId, ...options }),
    ).not.toThrow();
  });
});
