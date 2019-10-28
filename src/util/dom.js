/* eslint-disable import/prefer-default-export */
export const inlineStyles = styles =>
  Object.keys(styles).reduce((acc, key) => `${acc}${key}: ${styles[key]};`, '');

export const inlineStylesState = styles => {
  let state = { ...styles };
  function res(newStyles) {
    state = {
      ...state,
      ...newStyles,
    };
    return inlineStyles(state);
  }
  res.toString = () => inlineStyles(state);
  return res;
};
