import CrossWindowMessenger from '@endpass/class/CrossWindowMessenger';
import Widget from '@/plugins/WidgetPlugin/WidgetPlugin';
import { getWidgetFrameStylesObject } from '@/plugins/WidgetPlugin/WidgetStyles';
import { MESSENGER_METHODS, WIDGET_EVENTS } from '@/constants';

describe('Widget class', () => {
  const url = 'https://auth.foo.bar/public/widget';
  let messenger;
  let messengerGroup;
  let widget;
  const spies = [];
  function spyMessenger(method, fn) {
    return jest
      .spyOn(CrossWindowMessenger.prototype, method)
      .mockImplementation(fn);
  }

  beforeEach(() => {
    messenger = {
      setTarget: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    };
    messengerGroup = {
      removeMessenger: jest.fn(),
      addMessenger: jest.fn(),
    };

    spies.push(
      spyMessenger('subscribe', (method, cb) => {
        messenger.subscribe(method, cb);
      }),
    );

    spies.push(
      spyMessenger('setTarget', target => {
        messenger.setTarget(target);
      }),
    );

    spies.push(
      spyMessenger('unsubscribe', (method, cb) => {
        messenger.unsubscribe(method, cb);
      }),
    );

    widget = new Widget({ messengerGroup, url });
  });

  afterEach(() => {
    spies.forEach(mock => {
      mock.mockRestore();
    });
    spies.length = 0;
    jest.clearAllMocks();
  });

  describe('mount', () => {
    beforeEach(() => {
      jest.spyOn(document.body, 'insertAdjacentHTML');
      widget.subscribe = jest.fn();
    });

    it('should mount iframe for widget with initial styles', () => {
      widget.mount();

      expect(messenger.setTarget).toBeCalledWith(widget.frame.contentWindow);

      expect(document.body.insertAdjacentHTML.mock.calls[0][0]).toBe(
        'afterBegin',
      );
      expect(
        document.body.insertAdjacentHTML.mock.calls[0][1],
      ).toMatchSnapshot();
      expect(widget.subscribe).not.toBeCalled();
    });

    it('should mount iframe for widget with initial styles and cahce position to instance', () => {
      const params = { position: { top: '15px', left: '15px' } };

      widget.mount(params);

      expect(
        document.body.insertAdjacentHTML.mock.calls[0][1],
      ).toMatchSnapshot();
      expect(widget.position).toEqual(params.position);
    });
  });

  describe('unmount', () => {
    it('should unmount widget after it faded out', () => {
      jest.spyOn(window, 'removeEventListener');
      jest.useFakeTimers();

      widget.mount({ position: { top: '15px', left: '15px' } });

      widget.emitFrameEvent = jest.fn();
      widget.frame.removeEventListener = jest.fn();
      widget.frame.remove = jest.fn();

      widget.unmount();

      expect(widget.frame.removeEventListener).toBeCalledWith(
        'load',
        expect.any(Function),
      );
      expect(window.removeEventListener).toBeCalledWith(
        'resize',
        expect.any(Function),
      );

      jest.advanceTimersByTime(300);

      expect(widget.emitFrameEvent).toBeCalledWith('destroy');
      expect(widget.frame).toBeNull();
    });

    it('should unmount widget once', async () => {
      expect.assertions(4);

      await widget.mount();

      expect(widget.isMounted).toBe(true);

      widget.unmount();

      expect(widget.isMounted).toBe(false);

      widget.unmount();

      expect(messengerGroup.addMessenger).toBeCalledTimes(1);
      expect(messengerGroup.removeMessenger).toBeCalledTimes(1);
    });

    it('should mount widget once', async () => {
      expect.assertions(3);

      await widget.mount();

      expect(widget.isMounted).toBe(true);

      widget.mount();

      expect(messengerGroup.removeMessenger).toBeCalledTimes(0);
      expect(messengerGroup.addMessenger).toBeCalledTimes(1);
    });
  });

  describe('handleWidgetFrameLoad', () => {
    it('should emit load event and show widget', () => {
      widget.mount();
      const handler = jest.fn();
      widget.frame.addEventListener(WIDGET_EVENTS.MOUNT, handler);

      widget.handleWidgetFrameLoad();

      expect(handler).toBeCalled();
      expect(widget.frame.style.opacity).toBe('1');
    });
  });

  describe('emitFrameEvent', () => {
    it('should emit frame event through frame element', () => {
      widget.mount();
      const handler = jest.fn();
      widget.frame.addEventListener('foo', handler);

      const handlerNotCall = jest.fn();
      widget.frame.addEventListener('bar', handlerNotCall);

      widget.emitFrameEvent('foo', {
        bar: 'baz',
      });

      expect(handler).toBeCalledWith(expect.any(Object));
      expect(handlerNotCall).not.toBeCalled();
    });
  });

  describe('resize', () => {
    it('should resize frame', () => {
      widget.frame = {
        style: {
          height: 0,
        },
      };
      widget.resize({
        height: 300,
      });

      expect(widget.frame.style.height).toBe(300);
    });
  });

  describe('subscribe', () => {
    it('should subscribe on messenger view-responsible methods', () => {
      widget.subscribe();

      expect(messenger.setTarget).not.toBeCalled();
      expect(messenger.subscribe).toBeCalledWith(
        MESSENGER_METHODS.WIDGET_OPEN,
        expect.any(Function),
      );
      expect(messenger.subscribe).toBeCalledWith(
        MESSENGER_METHODS.WIDGET_CLOSE,
        expect.any(Function),
      );
      expect(messenger.subscribe).toBeCalledWith(
        MESSENGER_METHODS.WIDGET_FIT,
        expect.any(Function),
      );
    });
  });

  describe('getWidgetNode', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    it('should returns promise which resolves with widget element node', done => {
      expect.assertions(1);

      const frameNode = {
        foo: 'bar',
      };

      widget.frame = frameNode;
      widget.getWidgetNode().then(res => {
        expect(res).toEqual(frameNode);
        done();
      });

      jest.advanceTimersByTime(500);
    });
  });

  describe('getWidgetFrameStylesObject', () => {
    const position = {
      top: '15px',
      right: '15px',
    };

    it('should styles object with opacity 0 if widget is not loaded', () => {
      widget.isLoaded = false;

      const styles = getWidgetFrameStylesObject(widget);

      expect(styles.opacity).toBe(0);
    });

    it('should styles object with opacity 1 if widget is loaded', () => {
      widget.isLoaded = true;

      const styles = getWidgetFrameStylesObject(widget);

      expect(styles.opacity).toBe(1);
    });

    it('should includes position styles if it is defined in the instance', () => {
      widget.isLoaded = true;
      widget.position = position;

      const styles = getWidgetFrameStylesObject(widget);

      expect(styles.top).toBe(position.top);
      expect(styles.right).toBe(position.right);
    });
  });

  describe('getWidgetFrameInlineStyles', () => {
    it('should returns styles with current height if widget is mounted', () => {
      widget.frame = {
        clientHeight: 400,
      };

      const inlineStyles = widget.getWidgetFrameInlineStyles();

      expect(inlineStyles).toContain('height: 400px');
    });
  });
});
