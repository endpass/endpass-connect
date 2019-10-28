import { MESSENGER_METHODS } from '@/constants';
import { DialogPlugin } from '@/plugins/DialogPlugin';
import StateOpen from '@/plugins/DialogPlugin/states/StateOpen';
import StateClose from '@/plugins/DialogPlugin/states/StateClose';
import { getAuthUrl, getFrameRouteUrl } from '@/util/url';
import { DEFAULT_AUTH_URL } from '@/constants';

describe('DialogPlugin class', () => {
  const authUrl = 'url';
  const context = {
    handleEvent: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open/close dialog', () => {
    const inst = new DialogPlugin({ authUrl }, context);
    inst.mount();

    expect(inst.state).toBeInstanceOf(StateClose);

    inst.handleEvent(null, {
      method: MESSENGER_METHODS.DIALOG_OPEN,
    });

    expect(inst.state).toBeInstanceOf(StateOpen);

    inst.handleEvent(null, {
      method: MESSENGER_METHODS.DIALOG_CLOSE,
    });

    expect(inst.state).toBeInstanceOf(StateClose);
  });

  describe('auth url correct creation', () => {
    it('should return url to auth on connect application', () => {
      const url = getAuthUrl(authUrl);
      expect(getFrameRouteUrl(url, 'foo')).toBe(`${authUrl}/foo`);

      const plugin = new DialogPlugin({ authUrl }, context);
      expect(plugin.url).toBe(`${authUrl}/bridge`);
    });

    it('should return default authUrl', () => {
      const plugin = new DialogPlugin({}, context);

      expect(plugin.url).toBe(`${DEFAULT_AUTH_URL}/bridge`);
    });
  });
});
