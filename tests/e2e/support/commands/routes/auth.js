import { identityAPIUrl, visitUrl } from '@config';
import { v3 } from '@fixtures/identity/accounts';
import { responseSuccess } from '@fixtures/response';

Cypress.Commands.add('mockAuthPermission', () => {
  cy.route({
    url: `${identityAPIUrl}/auth/permission`,
    method: 'GET',
    status: 200,
    response: {
      keystore: v3,
    },
  });

  cy.route({
    url: `${identityAPIUrl}/auth/permission`,
    method: 'POST',
    status: 200,
    response: responseSuccess,
  });
});

Cypress.Commands.add('mockAuthLogin', (challengeType = 'emailLink') => {
  cy.route({
    url: `${identityAPIUrl}/auth?redirect_uri=${visitUrl}`,
    method: 'POST',
    status: 200,
    response: { success: true, challenge: { challengeType } },
  });

  cy.route({
    url: `${identityAPIUrl}/auth/token`,
    method: 'POST',
    status: 200,
    response: responseSuccess,
  });
});

Cypress.Commands.add('mockAuthCheck', status => {
  cy.route({
    method: 'GET',
    url: `${identityAPIUrl}/auth/check`,
    status,
    response: {},
  });
});

Cypress.Commands.add('mockAuthLogout', () => {
  cy.route({
    url: `${identityAPIUrl}/logout`,
    method: 'POST',
    status: 200,
    response: responseSuccess,
  });
});
