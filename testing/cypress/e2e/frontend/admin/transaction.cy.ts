describe("transaction test", () => {
  it("transaction", () => {
    cy.viewport("macbook-16");
    cy.visit("http://localhost:5899/login");
    // cy.get(
    //   "#root > div > nav > div > div.nav-actions > div > a.nav-link.login"
    // ).click();
    cy.url().should("include", "/login");
    cy.wait(2000);
    cy.get("#email").type("admin@admin.com");
    cy.get("#password").type("password123");
    cy.get('[data-cy="login-button"]').click();
    cy.wait(4000);
    cy.get('[data-cy="trans-btn"]').click();
    cy.get('[data-cy="view-btn"]').first().click();
  });
});
