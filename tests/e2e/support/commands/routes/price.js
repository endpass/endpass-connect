import { etherPrices } from '@fixtures/cryptodata/price';
import { cryptodataAPIUrl } from '@config';

Cypress.Commands.add('mockEtherPrices', () => {
  cy.route({
    url: `${cryptodataAPIUrl}/price?**`,
    method: 'GET',
    status: 200,
    response: etherPrices,
  });
});
