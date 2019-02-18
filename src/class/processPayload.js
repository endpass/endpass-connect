export default function(payload, settings) {
  let result = null;

  switch (payload.method) {
    case 'eth_accounts':
      result = settings.activeAccount ? [settings.activeAccount] : [];
      break;
    case 'eth_coinbase':
      result = settings.activeAccount || null;
      break;
    case 'eth_uninstallFilter':
      // todo: add tests for this case
      result = true;
      break;
    case 'net_version':
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
