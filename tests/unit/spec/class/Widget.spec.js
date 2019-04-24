import Widget from '@/class/Widget';

describe('Widget class', () => {
  const url = 'https://auth.foo.bar/public/widget';
  let messenger;
  let context;

  beforeEach(() => {
    messenger = {
      setTarget: jest.fn(),
    };
    context = {
      getWidgetMessenger: () => messenger,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('mount', () => {
    let widget;

    beforeEach(() => {
      jest.spyOn(document.body, 'insertAdjacentHTML');
      widget = new Widget({ context, url });
    });

    it('should mount iframe for widget', () => {
      widget.mount();

      expect(document.body.insertAdjacentHTML.mock.calls[0][0]).toBe(
        'afterBegin',
      );
      expect(
        document.body.insertAdjacentHTML.mock.calls[0][1],
      ).toMatchSnapshot();
      expect(messenger.setTarget).toBeCalled();
    });

    it('should mount iframe with given parameters', () => {
      widget.mount({ position: { top: '15px', left: '15px' } });

      expect(
        document.body.insertAdjacentHTML.mock.calls[0][1],
      ).toMatchSnapshot();
    });
  });

  describe('unmount', () => {
    it('should unmount widget after it faded out', () => {
      jest.useFakeTimers();

      const widget = new Widget({ context, url });

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
      const widget = new Widget({ context, url });

      widget.frame = {
        style: {
          opacity: 0,
        },
      };
      widget.emitFrameEvent = jest.fn();
      widget.handleWidgetFrameLoad();

      expect(widget.emitFrameEvent).toBeCalledWith('mount');
      expect(widget.frame.style.opacity).toBe(1);
    });
  });

  describe('emitFrameEvent', () => {
    it('should emit frame event through frame element', () => {
      const widget = new Widget({ context, url });

      widget.frame = {
        dispatchEvent: jest.fn(),
      };
      widget.emitFrameEvent('foo', {
        bar: 'baz',
      });

      expect(widget.frame.dispatchEvent).toBeCalledWith(expect.any(Object));
    });
  });

  describe('resize', () => {
    it('should resize frame', () => {
      const widget = new Widget({ context, url });

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
});
