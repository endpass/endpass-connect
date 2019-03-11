declare module 'web3-providers-http' {
  type SendCallback = (
    error: string,
    result: any,
  ) => void

  class Web3HttpProvider {
    constructor(host: string);
    host: string;
    send(payload: any, callback: SendCallback): void;
  }
  export = Web3HttpProvider;
}
