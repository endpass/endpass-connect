import { createWalletClass } from '@endpass/class';
import web3 from './singleton/web3';

const Wallet = createWalletClass(web3);
export default Wallet;
