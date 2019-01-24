/* eslint-disable import/prefer-default-export */
export const inlineStyles = styles =>
  Object.keys(styles).reduce((acc, key) => `${acc}${key}: ${styles[key]};`, '');
