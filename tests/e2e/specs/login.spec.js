describe('login', function() {
  describe('connect login features', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4444');
      cy.finishSetup();
      cy.wait(5000);
    });

    afterEach(() => {
      cy.clearMocks();
    });

    it('should be not logged if check response was failed', () => {
      cy.mockRouteOnce({
        url: 'https://identity-dev.endpass.com/api/v1.1/auth/check',
        method: 'GET',
        status: 401,
        response: {},
      });
      cy.get('[data-test=endpass-app-loader]').should('not.exist');
      cy.get('[data-test=endpass-sign-in-button]');
    });

    it('should cancel login on dialog close', () => {
      cy.mockRouteOnce({
        url: 'https://identity-dev.endpass.com/api/v1.1/auth/check',
        method: 'GET',
        status: 401,
        response: {},
      });
      cy.get('[data-test=endpass-sign-in-button]').click();
      cy.get('[data-visible=true]');
      cy.get('[data-visible=true] iframe');
      // cy.createIframeContext('[data-visible=true] iframe', iframe => {
      //   cy.log(cy.wrap(iframe));
      //   cy.wrap(iframe).get('input');
      // });
    });
  });
});
