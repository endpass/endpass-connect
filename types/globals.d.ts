declare namespace ENV {
  const oauthServer: string;
  const isProduction: boolean;
}

declare type Listener = (...args: any) => void
