import Widget from '@/class/Widget';
import { METHODS, WIDGET_EVENTS } from '@/constants';

describe('Widget class', () => {
  const url = 'https://auth.foo.bar/public/widget';
  let messenger;
  let context;
  let widget;

  beforeEach(() => {
    messenger = {
      setTarget: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    };
    context = {
      getWidgetMessenger: () => messenger,
    };
    widget = new Widget({ context, url });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('mount', () => {
    beforeEach(() => {
      jest.spyOn(document.body, 'insertAdjacentHTML');
      widget.subscribe = jest.fn();
    });

    it('should mount iframe for widget with initial styles', () => {
      widget.mount();

      expect(document.body.insertAdjacentHTML.mock.calls[0][0]).toBe(
        'afterBegin',
      );
      expect(
        document.body.insertAdjacentHTML.mock.calls[0][1],
      ).toMatchSnapshot();
      expect(widget.subscribe).toBeCalled();
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
    beforeEach(() => {
      widget.subscribe = jest.fn();
    });

    it('should unmount widget after it faded out', () => {
      jest.spyOn(window, 'removeEventListener');
      jest.useFakeTimers();

      widget.mount({ position: { top: '15px', left: '15px' } });

      widget.emitFrameEvent = jest.fn();
      widget.frame.removeEventListener = jest.fn();
      widget.frame.remove = jest.fn();

      widget.unmount();

      jest.advanceTimersByTime(300);

      expect(widget.emitFrameEvent).toBeCalledWith('destroy');
      expect(widget.frame.removeEventListener).toBeCalledWith(
        'load',
        expect.any(Function),
      );
      expect(window.removeEventListener).toBeCalledWith(
        'resize',
        expect.any(Function),
      );
      expect(widget.frame.remove).toBeCalled();
      expect(messenger.unsubscribe).toBeCalledTimes(5);
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
      const contentWindow = 'foo';

      widget.frame = {
        contentWindow,
      };
      widget.subscribe();

      expect(messenger.setTarget).toBeCalledWith(contentWindow);
      expect(messenger.subscribe).toBeCalledWith(
        METHODS.WIDGET_OPEN,
        expect.any(Function),
      );
      expect(messenger.subscribe).toBeCalledWith(
        METHODS.WIDGET_CLOSE,
        expect.any(Function),
      );
      expect(messenger.subscribe).toBeCalledWith(
        METHODS.WIDGET_FIT,
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

      const styles = widget.getWidgetFrameStylesObject();

      expect(styles.opacity).toBe(0);
    });

    it('should styles object with opacity 1 if widget is loaded', () => {
      widget.isLoaded = true;

      const styles = widget.getWidgetFrameStylesObject();

      expect(styles.opacity).toBe(1);
    });

    it('should includes position styles if it is defined in the instance', () => {
      widget.isLoaded = true;
      widget.position = position;

      const styles = widget.getWidgetFrameStylesObject();

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
