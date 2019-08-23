import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import Dialog from '@/class/Dialog';
import { METHODS } from '@/constants';

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

    expect(inst.isShown).toBe(false);

    cbs[METHODS.DIALOG_OPEN]();

    expect(inst.isShown).toBe(true);

    cbs[METHODS.DIALOG_CLOSE]();

    expect(inst.isShown).toBe(false);
  });
});
