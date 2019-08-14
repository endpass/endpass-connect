describe('widget', function() {
  describe('widget features', () => {
    beforeEach(() => {
      cy.server();
      return cy.beforePrepares();
    });

    it('should expand widget', () => {
      cy.mockInitialData();

      cy.authFrameContinueRun();

      cy.shouldLoggedIn();

      cy.widgetFrame('[data-test=widget-header-status]').click();

      cy.widgetFrame('[data-test=new-account-button]').should('exist');
    });
  });
});
