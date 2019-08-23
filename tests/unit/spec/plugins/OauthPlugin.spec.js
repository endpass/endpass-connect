import OauthPlugin from '@/plugins/OauthPlugin';

describe('Oauth plugin', () => {
  const oauthClientId = 'xxxxxxxxxx';
  const dialog = {
    ask: jest.fn(),
  };
  const context = {
    getDialog() {
      return dialog;
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throw error without apiKey', () => {
    expect(() => new OauthPlugin({ context })).toThrow();
    expect(() => new OauthPlugin({ context, options: {} })).toThrow();
    expect(
      () => new OauthPlugin({ context, options: { oauthClientId: undefined } }),
    ).toThrow();
    expect(
      () => new OauthPlugin({ context, options: { oauthClientId } }),
    ).not.toThrow();
  });
});
