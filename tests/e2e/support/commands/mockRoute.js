import { identityAPIUrl } from '../config';

Cypress.Commands.add('mockRoute', payload => {
  cy.window().then(win => {
    return win.e2eBridge.mockRoute(payload);
  });
});
Cypress.Commands.add('mockRouteOnce', payload => {
  cy.window().then(win => {
    return win.e2eBridge.mockRouteOnce(payload);
  });
});
Cypress.Commands.add('clearMocks', () => {
  return cy.window().then(win => {
    return win.e2eBridge.clearMocks();
  });
});

Cypress.Commands.add('checkMocks', () => {
  cy.mockRoute({
    url: `${identityAPIUrl}/**`,
    method: 'GET',
    status: 400,
    response: {
      message: 'mock all request from server!!!!',
    },
  });
});
