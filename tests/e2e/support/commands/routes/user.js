import { identityAPIUrl } from '../../config';
import { responseSuccess } from '../../../../fixtures/response';

Cypress.Commands.add('mockUserSeed', () => {
  cy.mockRouteOnce({
    url: `${identityAPIUrl}/user/seed`,
    method: 'POST',
    status: 200,
    response: responseSuccess,
  });
});
