import { v3 } from '@fixtures/identity/accounts';
import { responseSuccess } from '@fixtures/response';
import { identityAPIUrl, visitUrl, visitBlockBasic } from '@config';

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
    url: `${identityAPIUrl}/auth?redirect_uri=${visitUrl}${visitBlockBasic}`,
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

Cypress.Commands.add('mockAuthRecover', email => {
  cy.route({
    url: `${identityAPIUrl}/auth/recover?email=${email}`,
    method: 'get',
    status: 200,
    response: {
      success: true,
      message: '71d45eb3-480b-4034-9278-9a17eed20d49',
    },
  });
  cy.route({
    url: `${identityAPIUrl}/auth/recover`,
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
