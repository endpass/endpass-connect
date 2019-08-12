import { identityAPIUrl } from '../../config';
import {
  accountList,
  hdv3,
  hdv3Info,
  v3,
  v3Info,
} from '../../../../fixtures/identity/accounts';

Cypress.Commands.add('mockAccounts', () => {
  cy.mockRoute({
    url: `${identityAPIUrl}/accounts`,
    method: 'GET',
    status: 200,
    response: accountList,
  });

  cy.mockRoute({
    url: `${identityAPIUrl}/account/**`,
    method: 'POST',
    status: 200,
    response: { success: true, message: 'Account updated' },
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
    url: `${identityAPIUrl}/account/${v3.address}`,
    method: 'GET',
    status: 200,
    response: v3,
  });

  cy.mockRoute({
    url: `${identityAPIUrl}/account/${v3.address}/info`,
    method: 'GET',
    status: 200,
    response: v3Info,
  });
});
