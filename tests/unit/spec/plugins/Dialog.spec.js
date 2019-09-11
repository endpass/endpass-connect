import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import { MESSENGER_METHODS } from '@/constants';
import ExternalPlugin, { DialogPlugin } from '@/plugins/DialogPlugin';
import StateOpen from '@/plugins/DialogPlugin/states/StateOpen';
import StateClose from '@/plugins/DialogPlugin/states/StateClose';


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
});
