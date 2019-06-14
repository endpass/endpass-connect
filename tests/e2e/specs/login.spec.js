describe('login', function() {
  beforeEach(() => {
    cy.visit('http://localhost:4000');
    cy.finishSetup();
  });

  it('should be not logged in by default', () => {
    cy.mockRouteOnce({
      url: 'https://identity-dev.endpass.com/api/v1.1/auth/check',
      method: 'GET',
      status: 401,
      response: {
        foo: 'bar',
      },
    });
    cy.contains('Sign in with Endpass');
  });
});
