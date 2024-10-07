import "cypress-file-upload";

describe("upload page test", () => {
  it("should navigate to the Upload page when Start Upload link is clicked", () => {
    //   cy.get(
    //     "#root > div > nav > div > div.navbar-collapse > ul > li:nth-child(4) > a"
    //   ).click();
    cy.visit("http://localhost:5899/upload");
    cy.get("#email").type("bbb@gmail.com");
    cy.get("#password").type("12345678");
    cy.get('[data-cy="login-button"]').click();
    cy.wait(2000);
    // cy.get(
    //   "#root > div > nav > div > div.navbar-collapse > ul > li:nth-child(1) > a"
    // ).click();
    cy.get('[data-cy="start-upload"]').first().click();
    // #root > div > nav > div > div.nav-actions > a.nav-link.start-upload > div
    cy.url().should("include", "/upload");
    const imagePath = "img1.png";
    cy.wait(2000);
    cy.get('[data-cy="file-input"]').attachFile(imagePath);
    cy.wait(1000);
    cy.get("#formTitle").type("img1");
    cy.get("#formDescription").type("hehe");
    // cy.get("#formIsFree").click();
    // cy.get("#formPrice").type("1");
    cy.get('[data-cy="upload-button"]').click();
    cy.get('[data-cy="success-message"]').should(
      "contain",
      "File uploaded successfully!"
    );
  });
});
