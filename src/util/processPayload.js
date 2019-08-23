import { WEB3_METHODS } from '@/constants';

export default function(payload, settings) {
  let result = null;

  switch (payload.method) {
    case WEB3_METHODS.ETH_ACCOUNTS:
      result = settings.activeAccount ? [settings.activeAccount] : [];
      break;
    case WEB3_METHODS.ETH_COINBASE:
      result = settings.activeAccount || null;
      break;
    case WEB3_METHODS.ETH_UNINSTALL_FILTER:
      result = true;
      break;
    case WEB3_METHODS.NET_VERSION:
      result = settings.activeNet || null;
      break;
    default:
      break;
  }

  return {
    id: payload.id,
    jsonrpc: payload.jsonrpc,
    result,
  };
}
