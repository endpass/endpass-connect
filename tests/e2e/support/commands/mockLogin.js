import accounts from '../../../fixtures/identity/account/accounts';
import settings from '../../../fixtures/identity/settings';
import { cryptodataAPIUrl, identityAPIUrl } from '../config';
import { hdv3, hdv3Info } from '../../../fixtures/account/v3';
import balanceEmpty from '../../../fixtures/cryptodata/balanceEmpty';


Cypress.Commands.add('mockLogin', () => {
  cy.mockRoute({
    url: `${identityAPIUrl}/auth/check`,
    method: 'GET',
    status: 200,
    response: {},
  });

  cy.mockRoute({
    url: `${identityAPIUrl}/accounts`,
    method: 'GET',
    status: 200,
    response: accounts,
  });

  cy.mockRoute({
    url: `${identityAPIUrl}/settings`,
    method: 'GET',
    status: 200,
    response: settings,
  });

  cy.mockRoute({
    url: `${identityAPIUrl}/account/${hdv3.address}`,
    method: 'GET',
    status: 200,
    response: hdv3,
  });

  cy.mockRoute({
    url: `${identityAPIUrl}/account/${hdv3.address}/info`,
    method: 'GET',
    status: 200,
    response: hdv3Info,
  });

  cy.mockRoute({
    url: `${cryptodataAPIUrl}/1/balance/${hdv3.address}`,
    method: 'GET',
    status: 200,
    response: balanceEmpty,
  });

  cy.wait(250);
});
