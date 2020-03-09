declare namespace ENV {
  const oauthServer: string;
  const isShowConnectVersion: boolean;
  const authVersion: string;
  const version: string;
}

declare type Listener = (...args: any) => void;

declare type Token = string;
