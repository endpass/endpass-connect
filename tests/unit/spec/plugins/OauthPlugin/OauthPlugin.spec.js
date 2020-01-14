import OauthPlugin from '@/plugins/OauthPlugin';

describe('OauthPlugin plugin', () => {
  const clientId = 'xxxxxxxxxx';

  const options = { widget: false };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throw error without apiKey', () => {
    expect(() => new OauthPlugin()).toThrow();
    expect(() => new OauthPlugin(options)).toThrow();
    expect(
      () => new OauthPlugin({ clientId: undefined, ...options }),
    ).toThrow();
    expect(() => new OauthPlugin({ clientId, ...options })).not.toThrow();
  });
});
