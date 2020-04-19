declare module 'axios-token-interceptor' {
  import { AxiosRequestConfig } from 'axios';

  type InterceptorOptions = {
    header?: string;
    headerFormatter?: Function;
    getToken?: any;
    token?: object | Promise<any>;
    getMaxAge?: Function;
    maxAge?: number;
  };

  type GetTokenFunction = (options: InterceptorOptions) => string;
  type InterceptRequestFunction = (
    value: AxiosRequestConfig,
  ) => AxiosRequestConfig | Promise<AxiosRequestConfig>;

  export default function tokenInterceptor(
    options: InterceptorOptions,
  ): InterceptRequestFunction;
  export function tokenCache(
    getToken: GetTokenFunction,
    options: InterceptorOptions,
  ): number | Function;
}
