import { identityAPIUrl } from '@config';

Cypress.Commands.add('mockRegularPasswordCheck', (status = 200) => {
  cy.route({
    method: 'POST',
    url: `${identityAPIUrl}/regular-password/check`,
    status,
    response: {},
  });
});
