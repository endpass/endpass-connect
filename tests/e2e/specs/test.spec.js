describe('My First Test', function() {
  it('Does not do much!', function() {
    cy.visit('http://localhost:4000')
    expect(true).to.equal(true)
  })
})
