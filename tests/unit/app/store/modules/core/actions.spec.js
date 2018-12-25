import { sendMessageToOpener } from '@@/util/message';
import coreActions from '@@/app/src/store/modules/core/actions';

describe('core actions', () => {
  let dispatch;

  beforeEach(() => {
    jest.clearAllMocks();

    dispatch = jest.fn();
  });

  describe('sendMessage', () => {
    it('should send message with given data', async () => {
      expect.assertions(1);

      const data = {
        foo: 'bar',
      };

      await coreActions.sendMessage(null, data);

      expect(sendMessageToOpener).toBeCalledWith({
        data,
        from: 'dialog',
      });
    });
  });

  describe('sendReadyMessage', () => {
    it('should send message of application ready', async () => {
      expect.assertions(1);

      await coreActions.sendReadyMessage({ dispatch });

      expect(dispatch).toBeCalledWith('sendMessage', {
        method: 'connect_ready',
        status: true,
      });
    });
  });

  describe('closeDialog', () => {
    it('should close window', async () => {
      expect.assertions(1);

      jest.spyOn(window, 'close');

      await coreActions.closeDialog();

      expect(window.close).toBeCalled();
    });
  });
});
