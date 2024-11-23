describe('My First Test', () => {
  it('Visits the EduCheck App', () => {
    cy.visit('http://localhost:3000');
    cy.contains('教师主页').click();
    cy.url().should('include', '/teacher');
  });
});
