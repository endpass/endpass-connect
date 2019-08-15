import { responseSuccess } from '@fixtures/response';
import settings from '@fixtures/identity/settings';
import { email } from '@fixtures/identity/accounts';
import { identityAPIUrl, publicAPIUrl } from '@config';

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

  cy.route({
    url: `${publicAPIUrl}/user`,
    method: 'GET',
    status: 200,
    response: {
      email,
    },
  });
});
