describe('My First Test', function() {
  it('Does not do much!', function() {
    cy.visit('http://localhost:4004')
    expect(true).to.equal(true)
  })
})
