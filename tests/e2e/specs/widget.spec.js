describe('widget', function() {
  describe('widget features', () => {
    beforeEach(() => {
      cy.waitPageLoad();
    });

    it('should expand widget', () => {
      cy.authFrameContinueRun();

      cy.shouldLoggedIn();

      cy.getElementFromWidget('[data-test=widget-header-status]').click();

      cy.getElementFromWidget('[data-test=new-account-button]').should('exist');
    });
  });
});
