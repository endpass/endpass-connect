declare namespace ENV {
  const oauthServer: string;
  const isProduction: boolean;
}

declare type Listener = (...args: any) => void

declare module '@endpass/class/LocalStorage' {
  function remove(key: string): void;
  function save(key: string, data: any): void;
  function load(key: string): any;
}
