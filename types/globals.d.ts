declare namespace ENV {
  const oauthServer: string;
  const isProduction: boolean;
}

declare type Listener = (...args: any) => void

declare module '@endpass/utils/mapToQueryString' {
  function mapToQueryString(url: string, params: object): string;
  export = mapToQueryString;
}

declare module '@endpass/utils/queryStringToMap' {
  function queryStringToMap(path: string): object;
  export = queryStringToMap;
}

declare module '@endpass/utils/numbers' {
  function isNumeric(number: string | number): boolean;
}

declare module '@endpass/class/LocalStorage' {
  function remove(key: string): void;
  function save(key: string, data: any): void;
  function load(key: string): any;
}
