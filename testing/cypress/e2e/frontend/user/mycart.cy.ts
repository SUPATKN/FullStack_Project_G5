describe("my cart test", () => {
  it("should navigate to my cart", () => {
    cy.viewport("macbook-16");
    cy.visit("http://localhost:5899/login");

    cy.get("#email").type("aaa@gmail.com");
    cy.get("#password").type("12345678");
    cy.get('[data-cy="login-button"]').click();
    cy.wait(2000);
    cy.get('[data-cy="cart-btn"]').click();
  });
});
