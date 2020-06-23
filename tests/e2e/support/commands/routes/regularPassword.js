import { responseSuccess } from '@fixtures/response';
import { identityAPIUrl } from '@config';

Cypress.Commands.add('mockRegularPasswordResetConfirm', (status = 200) => {
  cy.route({
    method: 'POST',
    url: `${identityAPIUrl}/regular-password/reset/confirm`,
    status,
    response: responseSuccess,
  }).as('routeRegularPasswordResetConfirm');
});
