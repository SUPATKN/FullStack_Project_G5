describe("search test", () => {
  it("should search pic", () => {
    cy.visit("http://localhost:5899/login");

    cy.get("#email").type("aaa@gmail.com");
    cy.get("#password").type("12345678");
    cy.get('[data-cy="login-button"]').click();
    cy.wait(2000);
    cy.get(
      "#root > div > nav > div > div.navbar-collapse > ul > li:nth-child(5) > div > div > form > div > input"
    ).type("img1");
    cy.get(
      "#root > div > nav > div > div.navbar-collapse > ul > li:nth-child(5) > div > div > form > div > button"
    ).click();
    cy.wait(2000);
  });
});
