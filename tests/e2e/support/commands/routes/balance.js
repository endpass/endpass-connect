import { v3 } from '../../../../fixtures/identity/accounts';
import { cryptodataAPIUrl } from '../../config';
import { balanceEmpty } from '../../../../fixtures/cryptodata/balance';

Cypress.Commands.add('mockBalance', () => {
  cy.route({
    url: `${cryptodataAPIUrl}/1/balance/${v3.address}`,
    method: 'GET',
    status: 200,
    response: balanceEmpty,
  });
});
