describe('login', function() {
  beforeEach(() => {
    cy.visit('http://localhost:4000');
    cy.finishSetup();
  });

  it('should be not logged in by default', () => {
    cy.contains('Sign in with Endpass');
  });
});
