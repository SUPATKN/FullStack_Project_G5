describe("home page test", () => {
  it("should navigate to the Home page when Home link is clicked", () => {
    cy.viewport("macbook-16");
    cy.visit("http://localhost:5899/home");
    //   cy.get(
    //     "#root > div > nav > div > div.navbar-collapse > ul > li:nth-child(1) > a"
    //   ).click();
    cy.url().should("include", "/home");
    cy.wait(2000);
  });
});
