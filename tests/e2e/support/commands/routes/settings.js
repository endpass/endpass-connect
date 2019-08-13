import { identityAPIUrl } from '../../config';
import { responseSuccess } from '../../../../fixtures/response';
import settings from '../../../../fixtures/identity/settings';

Cypress.Commands.add('mockSettings', () => {
  cy.mockRoute({
    url: `${identityAPIUrl}/settings`,
    method: 'POST',
    status: 200,
    response: responseSuccess,
  });

  cy.mockRoute({
    url: `${identityAPIUrl}/settings`,
    method: 'GET',
    status: 200,
    response: settings,
  });
});
