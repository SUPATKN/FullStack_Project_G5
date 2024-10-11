describe("action test", () => {
  it("like comment", () => {
    cy.viewport("macbook-16");
    cy.visit("http://localhost:5899/login");
    // cy.get(
    //   "#root > div > nav > div > div.nav-actions > div > a.nav-link.login"
    // ).click();
    cy.url().should("include", "/login");
    cy.wait(2000);
    cy.get("#email").type("bbb@gmail.com");
    cy.get("#password").type("12345678");
    cy.get('[data-cy="login-button"]').click();
    cy.wait(2000);
    cy.get("#root > div > div > div.row > div:nth-child(1)").click();
    cy.wait(4000);
    cy.get('[data-cy="like-btn"]').click();
    cy.get('[data-cy="com-btn"]').click();
    cy.get('[data-cy="file-input"]').type("wow");
    cy.get('[data-cy="sub-btn"]').click();
    // cy.get('[data-cy="delete-btn"]').click(); //delete comment
    // cy.get('[data-cy="download-btn"]').click();
  });
});
