import OauthPlugin from '@/plugins/OauthPlugin';

describe('Oauth plugin', () => {
  const oauthClientId = 'xxxxxxxxxx';

  const context = {
    ask: jest.fn(),
  };
  const options = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throw error without apiKey', () => {
    expect(() => new OauthPlugin(options)).toThrow();
    expect(() => new OauthPlugin(options, context)).toThrow();
    expect(
      () => new OauthPlugin({ oauthClientId: undefined }),
    ).toThrow();
    expect(
      () => new OauthPlugin({ oauthClientId }),
    ).not.toThrow();
  });
});
