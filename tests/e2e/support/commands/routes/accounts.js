import {
  accountList,
  hdv3,
  hdv3Info,
  v3,
  v3Info,
} from '@fixtures/identity/accounts';
import { identityAPIUrl, publicAPIUrl } from '@config';

Cypress.Commands.add('mockAccountsList', (list = accountList) => {
  cy.route({
    method: 'GET',
    url: `${identityAPIUrl}/accounts`,
    status: 200,
    response: list,
  });

  cy.route({
    method: 'GET',
    url: `${publicAPIUrl}/accounts`,
    status: 200,
    response: list,
  });
});

Cypress.Commands.add('mockAccountUpdate', () => {
  cy.route({
    url: `${identityAPIUrl}/account/**`,
    method: 'POST',
    status: 200,
    response: { success: true, message: 'Account updated' },
  });
});

Cypress.Commands.add('mockAccountsV3', () => {
  cy.route({
    url: `${identityAPIUrl}/account/${hdv3.address}`,
    method: 'GET',
    status: 200,
    response: hdv3,
  });

  cy.route({
    url: `${identityAPIUrl}/account/${hdv3.address}/info`,
    method: 'GET',
    status: 200,
    response: hdv3Info,
  });

  cy.route({
    url: `${identityAPIUrl}/account/${v3.address}`,
    method: 'GET',
    status: 200,
    response: v3,
  });

  cy.route({
    url: `${identityAPIUrl}/account/${v3.address}/info`,
    method: 'GET',
    status: 200,
    response: v3Info,
  });
});

Cypress.Commands.add('mockRopstenFaucet', () => {
  cy.route({
    url: 'https://faucet.ropsten.be/donate/**',
    method: 'GET',
    status: 200,
    response: {},
  });
});
