import { addressesList } from '@fixtures/identity/addresses';
import { identityAPIUrl, publicAPIUrl } from '@config';

Cypress.Commands.add('mockUserMetric', () => {
  cy.route({
    url: `${identityAPIUrl}/user/metric`,
    method: 'POST',
    response: '',
    status: 200,
  }).as('routeUserMetric');
});

Cypress.Commands.add('mockUserAddress', () => {
  cy.route({
    url: `${publicAPIUrl}/user/address`,
    method: 'GET',
    response: addressesList,
    status: 200,
  }).as('routeUserAddress');
});