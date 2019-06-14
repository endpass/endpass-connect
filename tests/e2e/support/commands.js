// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('finishSetup', () => {
  // Explicitly waiting of e2eBridge injection
  cy.wait(500);
  cy.window().then(win => {
    cy.log(win);
    win.e2eBridge.finishSetup();
  });
});
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
