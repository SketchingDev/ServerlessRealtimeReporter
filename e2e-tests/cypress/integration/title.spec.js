/// <reference types="Cypress" />

context('Actions', () => {

  it('List processes', () => {
    cy.visit('/');
    cy.contains('Processes')
  })
});
