export const MOBILE_BREAKPOINT = 1024;
export const FADE_TIMEOUT = 300;
export const BASE_FRAME_HEIGHT = 80;
export const BASE_FRAME_STYLES = {
  position: 'fixed',
  'z-index': 6000000,
  height: `${BASE_FRAME_HEIGHT}px`,
  border: 'none',
  'border-radius': '4px',
  transition: `opacity ${FADE_TIMEOUT}ms ease-in`,
};
export const INITIAL_FRAME_STYLES = {
  ...BASE_FRAME_STYLES,
  opacity: 0,
};
export const FRAME_DESKTOP_STYLES = {
  ...BASE_FRAME_STYLES,
  width: '280px',
};
export const FRAME_MOBILE_STYLES = {
  ...BASE_FRAME_STYLES,
  right: '24px',
  bottom: '14px',
};
export const FRAME_MOBILE_COLLAPSED_STYLES = {
  ...FRAME_MOBILE_STYLES,
  width: '64px',
};
export const FRAME_MOBILE_EXPANDED_STYLES = {
  ...FRAME_MOBILE_STYLES,
  width: 'calc(100% - 24px * 2)',
};

export const getWidgetFrameDesktopPositionStylesObject = (position = {}) => {
  const actualPosition = {
    left: 'auto',
    right: 'auto',
    top: 'auto',
    bottom: 'auto',
    ...position,
  };

  if (actualPosition.left === 'auto' && actualPosition.right === 'auto') {
    Object.assign(actualPosition, {
      right: '15px',
    });
  }

  if (actualPosition.top === 'auto' && actualPosition.bottom === 'auto') {
    Object.assign(actualPosition, {
      bottom: '5px',
    });
  }

  return actualPosition;
};

export const getWidgetFrameStylesObject = ({
  isMobile,
  isExpanded,
  isLoaded,
  position,
}) => {
  const opacity = Number(isLoaded);
  switch (true) {
    case isMobile && isLoaded && isExpanded:
      return {
        ...FRAME_MOBILE_EXPANDED_STYLES,
        opacity,
      };
    case isMobile && isLoaded && !isExpanded:
      return {
        ...FRAME_MOBILE_COLLAPSED_STYLES,
        opacity,
      };
    case isLoaded:
      return {
        ...FRAME_DESKTOP_STYLES,
        ...getWidgetFrameDesktopPositionStylesObject(position),
        opacity,
      };
    default:
      return INITIAL_FRAME_STYLES;
  }
};
