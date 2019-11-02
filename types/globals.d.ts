declare namespace ENV {
  const oauthServer: string;
  const isProduction: boolean;
  const apiServer: string;
}

declare type Listener = (...args: any) => void

declare module '@endpass/class/LocalStorage' {
  function remove(key: string): void;
  function save(key: string, data: any): void;
  function load(key: string): any;
}

declare type OriginReq = {
  method: string,
  answer: Function,
}