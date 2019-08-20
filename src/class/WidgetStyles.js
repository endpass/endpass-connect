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
