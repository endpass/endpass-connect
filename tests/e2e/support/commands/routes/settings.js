import { identityAPIUrl } from '@config';
import { responseSuccess } from '@fixtures/response';
import settings from '@fixtures/identity/settings';

Cypress.Commands.add('mockSettings', () => {
  cy.route({
    url: `${identityAPIUrl}/settings`,
    method: 'POST',
    status: 200,
    response: responseSuccess,
  });

  cy.route({
    url: `${identityAPIUrl}/settings`,
    method: 'GET',
    status: 200,
    response: settings,
  });

  cy.route({
    url: `${identityAPIUrl}/user/seed`,
    method: 'POST',
    status: 200,
    response: responseSuccess,
  });
});
