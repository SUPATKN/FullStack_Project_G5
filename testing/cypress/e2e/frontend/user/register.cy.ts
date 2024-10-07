describe("register test", () => {
  it("sign up", () => {
    cy.visit("http://localhost:5899/register");
    // cy.get('[data-cy="signup-button"]').click();
    cy.get("#username").type("ccc");
    cy.get("#email").type("ccc@gmail.com");
    cy.get("#password").type("12345678");
    cy.get("#confirmPassword").type("12345678");
    cy.get('[data-cy="confirm-button"]').click();
  });
});
