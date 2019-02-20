import netRequest from './netRequest';
import payloadHandle from './payloadHandle';
import payloadEthUninstallFilter from './payloadEthUninstallFilter';
import payloadCheck from './payloadCheck';
import auth from './auth';

export default [
  auth,

  payloadHandle,
  payloadEthUninstallFilter,
  payloadCheck,

  netRequest,
];
