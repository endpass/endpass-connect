import { identityAPIUrl } from '../../config';
import { responseSuccess } from '../../../../fixtures/response';

Cypress.Commands.add('mockRouteLogout', () => {
  cy.route({
    url: `${identityAPIUrl}/logout`,
    method: 'POST',
    status: 200,
    response: responseSuccess,
  });
});
