import Network from '@endpass/class/Network';

/**
 * @typedef {object} Request
 * @property {object} payload Ethereum JSONRPC base request
 * @property {object} result Ehtereum JSONRPC response
 */

Cypress.Commands.add('setupWeb3Provider', (netId = Network.NET_ID.MAIN) => {
  cy.window().then(win => {
    win.setWeb3AuthProvider(netId);
  });
});

/**
 * @param {Request[]} [requests]
 */
Cypress.Commands.add('setupWeb3ProviderMocks', (requests = []) => {
  cy.window()
    .its('web3Auth.currentProvider')
    .then(provider => {
      if (!provider.mockResolvedValue) {
        // eslint-disable-next-line no-console
        console.warn(
          'cy.mockWeb3Provider: Use web3 MockProvider to mock requests to Ethereum nodes',
        );
        return;
      }

      requests.forEach(request => {
        if (request.once) {
          provider.mockResolvedValueOnce(request.payload, request.result);
        } else {
          provider.mockResolvedValue(request.payload, request.result);
        }
      });
    });
});
