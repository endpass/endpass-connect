// import '../../src/util/__mocks__/message.mock';

global.flushPromises = () => new Promise(resolve => setImmediate(resolve));

var localStorageMock = (function() {
    var store = {};

    return {
        getItem: function(key) {
            return store[key] || null;
        },
        setItem: function(key, value) {
            store[key] = value.toString();
        },
        clear: function() {
            store = {};
        },
        removeItem: function(key) {
            store[key] = null;
        }
    };
})();

global.localStorage = localStorageMock;


global.open = function() {};
global.close = function() {};
