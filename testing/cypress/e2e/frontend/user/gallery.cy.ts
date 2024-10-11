describe("gallery page test", () => {
  it("should navigate to the Gallery page when Gallery link is clicked", () => {
    cy.viewport("macbook-16");
    cy.visit("http://localhost:5899/");
    // cy.get(
    //   "#root > div > nav > div > div.navbar-collapse > ul > li.active > a"
    // ).click();
    cy.url().should("include", "/");
    cy.wait(2000);
    cy.get("#root > div > div > h3").should("contain", "GALLERY");
  });
});
