describe("tag test", () => {
  it("manage tag", () => {
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
    cy.get('[data-cy="tag-btn"]').click();
    // cy.get("#tagName").type("object");
    // cy.get('[data-cy="add-btn"]').click();
    cy.get('[data-cy="delete-btn"]').click(); //delete tag
    cy.wait(2000);
  });
});
