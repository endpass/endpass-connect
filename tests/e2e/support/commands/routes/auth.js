import { identityAPIUrl } from '../../config';
import { v3 } from '../../../../fixtures/identity/accounts';
import { responseSuccess } from '../../../../fixtures/response';

Cypress.Commands.add('mockAuthPermission', () => {
  cy.mockRoute({
    url: `${identityAPIUrl}/auth/permission`,
    method: 'GET',
    status: 200,
    response: {
      keystore: v3,
    },
  });

  cy.mockRoute({
    url: `${identityAPIUrl}/auth/permission`,
    method: 'POST',
    status: 200,
    response: responseSuccess,
  });
});

Cypress.Commands.add('mockAuthUser', (challengeType) => {
  cy.mockRoute({
    url: `${identityAPIUrl}/auth?redirect_uri=http%3A%2F%2Flocalhost%3A4444%2F%23%2Fbasic`,
    method: 'POST',
    status: 200,
    response: { success: true, challenge: { challengeType } },
  });

  cy.mockRoute({
    url: `${identityAPIUrl}/auth/token`,
    method: 'POST',
    status: 200,
    response: responseSuccess,
  });
});

Cypress.Commands.add('mockAuthCheckOnce', status => {
  cy.mockRouteOnce({
    url: `${identityAPIUrl}/auth/check`,
    method: 'GET',
    status,
    response: {},
  });
});

Cypress.Commands.add('mockAuth', () => {
  cy.mockRoute({
    url: `${identityAPIUrl}/auth/check`,
    method: 'GET',
    status: 200,
    response: {},
  });
  cy.mockAuthPermission();
});
