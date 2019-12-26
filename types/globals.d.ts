declare namespace ENV {
  const oauthServer: string;
  const isProduction: boolean;
  const authVersion: string;
  const version: string;
}

declare type Listener = (...args: any) => void;

declare type Token = string;
