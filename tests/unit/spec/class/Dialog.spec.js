import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import { METHODS } from '@/constants';
import Dialog from '@/class/Dialog';
import StateOpen from '@/class/Dialog/StateOpen';
import StateClose from '@/class/Dialog/StateClose';

describe('Dialog class', () => {
  const url = 'url';
  const messenger = {
    send: jest.fn(),
    sendAndWaitResponse: jest.fn(),
    setTarget: jest.fn(),
    subscribe: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open/close dialog', () => {
    const cbs = {};
    messenger.subscribe = (method, cb) => {
      cbs[method] = cb;
    };

    jest
      .spyOn(CrossWindowMessenger.prototype, 'subscribe')
      .mockImplementation((method, cb) => {
        cbs[method] = cb;
      });

    const inst = new Dialog({ url });

    expect(inst.state).toBeInstanceOf(StateClose);

    cbs[METHODS.DIALOG_OPEN]();

    expect(inst.state).toBeInstanceOf(StateOpen);

    cbs[METHODS.DIALOG_CLOSE]();

    expect(inst.state).toBeInstanceOf(StateClose);
  });
});
