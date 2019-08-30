import pkg from '../../package.json';

const authUrlRegexp = new RegExp('://auth(\\.|-)', 'ig');

export const getAuthUrl = url => {
  const authUrl = !authUrlRegexp.test(url)
    ? url
    : url.replace('://auth', `://auth${pkg.authVersion}`);
  return authUrl;
};

/**
 * Returns application url with passed method
 * @private
 * @param {string} authUrl base url
 * @param {string} method Expected method (route)
 * @returns {string} Completed url to open
 */
export const getFrameRouteUrl = (authUrl, method) => {
  return !method ? authUrl : `${authUrl}/${method}`;
};
