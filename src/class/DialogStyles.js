import { inlineStyles } from '@/util/dom';

export const propsWrapper = {
  'min-width': '320px',
  'max-width': '442px',
  margin: '50px auto',
};
export const stylesWrapperShow = inlineStyles({
  ...propsWrapper,
  transition: 'opacity 0.35s ease-in-out',
  opacity: 1,
});

export const stylesWrapperHide = inlineStyles({
  ...propsWrapper,
  opacity: 0,
});

export const stylesOverlayShow = inlineStyles({
  position: 'fixed',
  top: '0',
  left: '0',
  'z-index': '6000000',
  width: '100vw',
  height: '100vh',
  'overflow-y': 'auto',
  'background-color': 'rgba(0, 0, 0, 0.6)',
  opacity: 1,
});

export const stylesOverlayHide = inlineStyles({
  position: 'absolute',
  top: '-999px',
  left: '-999px',
  width: '0',
  height: '0',
  opacity: 0,
});

export const propsIframe = {
  width: '100%',
  height: '100%',
  'box-shadow': '0 5px 10px 1px rgba(0, 0, 0, 0.15)',
  'border-radius': '4px',
  border: 'none',
};

export const propsIframeHide = {
  opacity: 0.001,
};

export const propsIframeShow = {
  opacity: 1,
};
