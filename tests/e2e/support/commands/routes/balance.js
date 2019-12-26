import Network from '@endpass/class/Network';
import { cryptodataAPIUrl } from '@config';

Cypress.Commands.add(
  'mockBalance',
  ({
    balance = '1000000000000000000',
    tokens = [],
    netId = Network.NET_ID.MAIN,
  }) => {

    cy.route({
      url: `${cryptodataAPIUrl}/${netId}/balance/**`,
      method: 'GET',
      status: 200,
      response: {
        balance,
        tokens,
      },
    }).as('balance');
  },
);
