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
      const { connection } = provider;
      if (!connection || !connection.mockResolvedValue) {
        // eslint-disable-next-line no-console
        console.warn(
          'cy.mockWeb3Provider: Use web3 MockProvider to mock requests to Ethereum nodes',
        );
        return;
      }

      requests.forEach(request => {
        if (request.once) {
          connection.mockResolvedValueOnce(request.payload, request.result);
        } else {
          connection.mockResolvedValue(request.payload, request.result);
        }
      });
    });
});
