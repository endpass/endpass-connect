import './mocks/service/identity.mock';
import './mocks/util/message.mock';
import './mocks/class/singleton/web3.mock';
import './mocks/class/Wallet.mock';

global.flushPromises = () => new Promise(resolve => setImmediate(resolve));
