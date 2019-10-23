import { etherPrices, gasPrice } from '@fixtures/cryptodata/price';
import { cryptodataAPIUrl } from '@config';

Cypress.Commands.add('mockEtherPrices', () => {
  cy.route({
    url: `${cryptodataAPIUrl}/price?**`,
    method: 'GET',
    status: 200,
    response: etherPrices,
  }).as('routeEtherPrices');
});

Cypress.Commands.add('mockGasPrices', () => {
  cy.route({
    url: `${cryptodataAPIUrl}/*/gas/price`,
    method: 'GET',
    status: 200,
    response: gasPrice,
  });
});
