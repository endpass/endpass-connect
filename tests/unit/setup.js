// import '../../src/util/__mocks__/message.mock';
import 'jest-localstorage-mock';

global.flushPromises = () => new Promise(resolve => setImmediate(resolve));

global.open = function() {};
global.close = function() {};
