describe("payment test", () => {
  it("manage payment", () => {
    cy.viewport("macbook-16");
    cy.visit("http://localhost:5899/login");
    cy.url().should("include", "/login");
    cy.wait(2000);
    cy.get("#email").type("admin@admin.com");
    cy.get("#password").type("password123");
    cy.get('[data-cy="login-button"]').click();
    cy.url().should("include", "/");
    cy.get('[data-cy="approve-btn"]').first().click();
    // cy.get('[data-cy="reject-btn"]').click(); //reject
  });
});
