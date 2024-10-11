describe("creator page test", () => {
  it("should navigate to the Creator page when Creator link is clicked", () => {
    cy.viewport("macbook-16");
    cy.visit("http://localhost:5899/creator");
    //   cy.get(
    //     "#root > div > nav > div > div.navbar-collapse > ul > li:nth-child(3) > a"
    //   ).click();
    cy.get("#email").type("aaa@gmail.com");
    cy.get("#password").type("12345678");
    cy.get('[data-cy="login-button"]').click();
    cy.wait(2000);
    cy.get(
      "#root > div > nav > div > div.navbar-collapse > ul > li:nth-child(3) > a"
    ).click();
    cy.url().should("include", "/creator");
    cy.wait(2000);
  });
});
