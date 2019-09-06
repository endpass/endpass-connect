import OauthComponent from '@/class/components/OauthPlugin';

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
    expect(() => new OauthComponent({ context })).toThrow();
    expect(() => new OauthComponent({ context, options: {} })).toThrow();
    expect(
      () => new OauthComponent({ context, options: { oauthClientId: undefined } }),
    ).toThrow();
    expect(
      () => new OauthComponent({ context, options: { oauthClientId } }),
    ).not.toThrow();
  });
});
