describe('login', function() {
  describe('connect login features', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4444/#/basic');
      cy.wait(100);
    });

    afterEach(() => {
      // cy.clearMocks();
    });

    it('should login to system', () => {

      cy.startAuthBridge().then(() => {
        cy.mockRoute({
          url: 'https://identity-dev.endpass.com/api/v1.1/auth/check',
          method: 'GET',
          status: 401,
          response: {},
        });

        console.log('------ test are here');
        cy.get('[data-test=endpass-app-loader]').should('exist');
      });

      // cy.get('[data-test=endpass-sign-in-button]').should('exist');
      // cy.get('[data-test=endpass-sign-in-button]').click();
      // cy.get('[data-visible=true]');
      // cy.get('[data-visible=true] iframe');
    });

    it.skip('should cancel login on dialog close', () => {
      cy.mockRouteOnce({
        url: 'https://identity-dev.endpass.com/api/v1.1/auth/check',
        method: 'GET',
        status: 401,
        response: {},
      });

      cy.startAuthBridge();

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
