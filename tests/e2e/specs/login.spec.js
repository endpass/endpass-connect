describe('login', () => {
  describe('connect login features', () => {
    beforeEach(() => {
      cy.waitPageLoad();
    });

    it('should login if user already logged in on the server', () => {
      cy.mockAuthCheck(200);
      cy.authFrameContinueRun();

      cy.mockOnceOauthState();

      cy.get('[data-test=login-element] button').first().click();

      cy.shouldLoggedIn();
    });

    it('should logout from system', () => {
      cy.mockAuthCheck(200);
      cy.authFrameContinueRun();

      cy.shouldLoggedIn();

      cy.wait('@routeAuthCheck');

      cy.shouldLogout(
        () => cy.get('.header-controls-logout').click()
      );
    });
  });
});
