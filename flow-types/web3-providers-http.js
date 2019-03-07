// @flow

declare module 'web3-providers-http' {
  declare class Web3HttpProvider {
    constructor(host: string): Web3HttpProvider;

    host: string;

    send(
      payload: mixed,
      callback: (error: string, result: mixed) => void,
    ): void;
  }

  declare module.exports: typeof Web3HttpProvider;
}
