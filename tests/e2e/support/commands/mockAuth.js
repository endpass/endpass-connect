import { identityAPIUrl } from '../config';

Cypress.Commands.add('mockAuthCheckOnce', status => {
  cy.mockRouteOnce({
    url: `${identityAPIUrl}/auth/check`,
    method: 'GET',
    status,
    response: {},
  });
});
