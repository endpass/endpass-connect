// import '../../src/util/__mocks__/message.mock';

global.flushPromises = () => new Promise(resolve => setImmediate(resolve));
