import netRequest from './netRequest';
import payloadHandle from './payloadHandle';
import payloadEthUninstallFilter from './payloadEthUninstallFilter';
import payloadCheck from './payloadCheck';
import auth from './auth';
import requestProviderCheck from './requestProviderCheck';
import requestProviderSwitchActual from './requestProviderSwitchActual';
import settings from './settings';

export default [
  auth,

  settings,

  requestProviderCheck,
  requestProviderSwitchActual,

  payloadHandle,
  payloadEthUninstallFilter,
  payloadCheck,

  netRequest,
];
