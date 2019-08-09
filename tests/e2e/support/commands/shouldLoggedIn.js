import { address } from '../../../fixtures/identity/accounts';

Cypress.Commands.add('shouldLoggedIn', () => {
  cy.get('[data-test=endpass-app-loader]').should('not.exist');
  cy.authWrapperHidden().should('exist');
  cy.get('[data-test=endpass-form-basic-active-account]').should(
    'contain.text',
    address,
  );
});
