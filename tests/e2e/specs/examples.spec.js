import { email } from '@fixtures/identity/user';

describe('oauth', () => {
  beforeEach(() => {
    cy.waitPageLoad();
    cy.visit('/#/examples');
  });

  it('should render clickable tabs', () => {
    cy.get('.examples-showcase').should('exist');
    cy.get('.examples-showcase .v-tabs').should('exist');
    cy.get('.examples-showcase .code').should('exist');

    cy.get('.examples-showcase .v-tabs .is-active').should(
      'contain.text', 'Vanilla JS'
    );

    cy.get('.examples-showcase .v-tabs .v-tabs-control').eq(1).click();

    cy.get('.examples-showcase .v-tabs .is-active').should(
      'contain.text', 'Vue.js'
    );
  });

  it('should make requests', () => {
    cy.mockAuthCheck(200);
    cy.authFrameContinueRun();

    cy.mockOnceOauthState();

    cy.get('.examples-runtime .v-button').click();

    cy.wait('@routeAuthCheck');

    cy.get('.examples-runtime').should('contain.text', email);
  });
});
