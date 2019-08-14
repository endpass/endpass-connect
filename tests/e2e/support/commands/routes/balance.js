import { cryptodataAPIUrl } from '@config';

Cypress.Commands.add(
  'mockBalance',
  (balance = '1000000000000000000', tokens = []) => {
    cy.route({
      url: `${cryptodataAPIUrl}/1/balance/**`,
      method: 'GET',
      status: 200,
      response: {
        balance,
        tokens,
      },
    });
  },
);
