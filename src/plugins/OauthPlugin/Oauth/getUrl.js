import mapToQueryString from '@endpass/utils/mapToQueryString';

export default function(oauthServer, params) {
  const server = oauthServer || ENV.oauthServer;
  const url = mapToQueryString(`${server}/auth`, params);
  return url;
}
