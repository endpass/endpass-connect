import accounts from '../../../fixtures/identity/account/accounts';
import check403 from '../../../fixtures/identity/auth/check-403';
import token from '../../../fixtures/identity/auth/token';
import { identityAPIUrl } from '../config';

Cypress.Commands.add('mockLoginOtp', () => {
  cy.mockRoute({
    url: `${identityAPIUrl}/auth/check`,
    method: 'GET',
    status: 401,
    response: {},
  });
  //
  // cy.mockRoute({
  //   url: `${identityAPIUrl}/accounts`,
  //   method: 'GET',
  //   status: 200,
  //   response: accounts,
  // });
  //
  // cy.mockRouteOnce({
  //   url: `${identityAPIUrl}/auth/token`,
  //   method: 'GET',
  //   status: 200,
  //   response: token,
  // });
  //
  // cy.mockRouteOnce({
  //   url: `${identityAPIUrl}/auth/check`,
  //   method: 'GET',
  //   status: 403,
  //   response: check403,
  // });
  //
  // cy.mockRouteOnce({
  //   url: `${identityAPIUrl}/auth/check`,
  //   method: 'GET',
  //   status: 403,
  //   response: check403,
  // });
});
