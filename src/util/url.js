import { DEFAULT_AUTH_URL } from '@/constants';

export const getAuthUrl = (url = DEFAULT_AUTH_URL) => {
  return url;
};

/**
 * Returns application url with passed method
 * @private
 * @param {string} url base url
 * @param {string} method Expected method (route)
 * @returns {string} Completed url to open
 */
export const getFrameRouteUrl = (url, method) => {
  const authUrl = getAuthUrl(url);
  return !method ? authUrl : `${authUrl}/prepare.html?redirect=/${method}`;
};
