import { cryptodataAPIUrl } from '../../config';
import { balanceEmpty } from '../../../../fixtures/cryptodata/balance';

Cypress.Commands.add('mockBalance', () => {
  cy.route({
    url: `${cryptodataAPIUrl}/1/balance/**`,
    method: 'GET',
    status: 200,
    response: balanceEmpty,
  });
});
