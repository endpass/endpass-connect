Cypress.Commands.add('mockRoute', payload => {
  cy.window().then(win => {
    win.e2eBridge.mockRoute(payload);
  });
});
Cypress.Commands.add('mockRouteOnce', payload => {
  cy.window().then(win => {
    win.e2eBridge.mockRouteOnce(payload);
  });
});
Cypress.Commands.add('clearMocks', () => {
  cy.window().then(win => {
    win.e2eBridge.clearMocks();
  });
});
