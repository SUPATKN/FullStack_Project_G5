describe("instructor page test", () => {
  it("should navigate to the Instructor page when Instructor link is clicked", () => {
    //   cy.get(
    //     "#root > div > nav > div > div.navbar-collapse > ul > li:nth-child(4) > a"
    //   ).click();
    cy.visit("http://localhost:5899/instructor");
    cy.get("#email").type("aaa@gmail.com");
    cy.get("#password").type("12345678");
    cy.get('[data-cy="login-button"]').click();
    cy.wait(2000);
    cy.get(
      "#root > div > nav > div > div.navbar-collapse > ul > li:nth-child(4) > a"
    ).click();
    cy.url().should("include", "/instructor");
    cy.wait(2000);
  });
});
