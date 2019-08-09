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
