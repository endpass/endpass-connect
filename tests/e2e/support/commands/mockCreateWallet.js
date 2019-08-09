import { identityAPIUrl } from '../config';
import { responseSuccess } from '../../../fixtures/response';
import { accountList, v3 } from '../../../fixtures/identity/accounts';

Cypress.Commands.add('mockCreateWallet', () => {
  cy.mockRouteOnce({
    url: `${identityAPIUrl}/auth/check`,
    method: 'GET',
    status: 401,
    response: {},
  });

  cy.mockRouteOnce({
    url: `${identityAPIUrl}/auth/check`,
    method: 'GET',
    status: 401,
    response: {},
  });

  cy.mockRouteOnce({
    url: `${identityAPIUrl}/auth?redirect_uri=http%3A%2F%2Flocalhost%3A4444%2F%23%2Fbasic`,
    method: 'POST',
    status: 200,
    response: { success: true, challenge: { challengeType: 'emailLink' } },
  });

  cy.mockRouteOnce({
    url: `${identityAPIUrl}/auth/check`,
    method: 'GET',
    status: 403,
    response: {},
  });

  cy.mockRouteOnce({
    url: `${identityAPIUrl}/accounts`,
    method: 'GET',
    status: 200,
    response: [],
  });

  cy.mockRoute({
    url: `${identityAPIUrl}/account/**`,
    method: 'POST',
    status: 200,
    response: { success: true, message: 'Account updated' },
  });

  cy.mockRouteOnce({
    url: `${identityAPIUrl}/user/seed`,
    method: 'POST',
    status: 200,
    response: responseSuccess,
  });

  cy.mockRouteOnce({
    url: `${identityAPIUrl}/settings`,
    method: 'POST',
    status: 200,
    response: responseSuccess,
  });

  cy.mockRouteOnce({
    url: `${identityAPIUrl}/account`,
    method: 'POST',
    status: 403,
    response: {
      message: 'Forbidden',
    },
  });

  // seed phrase dialog
  cy.mockRouteOnce({
    url: `${identityAPIUrl}/accounts`,
    method: 'GET',
    status: 200,
    response: [accountList],
  });
  cy.mockRouteOnce({
    url: `${identityAPIUrl}/accounts`,
    method: 'GET',
    status: 200,
    response: [accountList],
  });

  cy.mockRouteOnce({
    url: `${identityAPIUrl}/auth/check`,
    method: 'GET',
    status: 403,
    response: {},
  });

  // apply password and login form
  cy.mockRouteOnce({
    url: `${identityAPIUrl}/auth/permission`,
    method: 'GET',
    status: 200,
    response: {
      keystore: v3,
    },
  });

  cy.mockRouteOnce({
    url: `${identityAPIUrl}/auth/permission`,
    method: 'POST',
    status: 200,
    response: responseSuccess,
  });
});
