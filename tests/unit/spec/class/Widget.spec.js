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

    it('should mount iframe for widget', () => {
      widget.mount();

      expect(document.body.insertAdjacentHTML.mock.calls[0][0]).toBe(
        'afterBegin',
      );
      expect(
        document.body.insertAdjacentHTML.mock.calls[0][1],
      ).toMatchSnapshot();
      expect(widget.subscribe).toBeCalled();
    });

    it('should mount iframe with given parameters', () => {
      widget.mount({ position: { top: '15px', left: '15px' } });

      expect(
        document.body.insertAdjacentHTML.mock.calls[0][1],
      ).toMatchSnapshot();
    });
  });

  describe('unmount', () => {
    beforeEach(() => {
      widget.subscribe = jest.fn();
    });

    it('should unmount widget after it faded out', () => {
      jest.useFakeTimers();

      widget.mount({ position: { top: '15px', left: '15px' } });
      widget.unmount();

      widget.emitFrameEvent = jest.fn();
      widget.frame.removeEventListener = jest.fn();
      widget.frame.remove = jest.fn();

      jest.advanceTimersByTime(300);

      expect(widget.emitFrameEvent).toBeCalledWith('destroy');
      expect(widget.frame.removeEventListener).toBeCalledWith(
        'load',
        expect.any(Function),
      );
      expect(widget.frame.remove).toBeCalled();
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
});
