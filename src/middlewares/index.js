import netRequest from './netRequest';
import payloadHandle from './payloadHandle';
import shiftItem from './shiftItem';
import payloadEthUninstallFilter from './payloadEthUninstallFilter';
import payloadCheck from './payloadCheck';

export default [
  payloadHandle,
  payloadEthUninstallFilter,
  payloadCheck,

  netRequest,
  shiftItem,
];
