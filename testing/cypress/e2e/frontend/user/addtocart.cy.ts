describe("add to cart test", () => {
  it("should add to cart", () => {
    cy.visit("http://localhost:5899/login");

    cy.get("#email").type("aaa@gmail.com");
    cy.get("#password").type("12345678");
    cy.get('[data-cy="login-button"]').click();
    cy.wait(2000);
    cy.get(
      "#root > div > nav > div > div.navbar-collapse > ul > li.active > a"
    ).click();
    cy.url().should("include", "/");
    cy.wait(2000);
    cy.get(
      "#root > div > div > div.row > div > div > div:nth-child(2) > button"
    )
      .first()
      .click();
    cy.get('[data-cy="cart-btn"]').click();
    cy.get("#root > div > div > div.Cart > div.checkout.w-100.mb-2").click();
  });
});
