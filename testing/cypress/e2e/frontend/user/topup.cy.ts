import "cypress-file-upload";

describe("top up test", () => {
  it("should top up", () => {
    cy.viewport("macbook-16");
    cy.visit("http://localhost:5899/login");

    cy.get("#email").type("aaa@gmail.com");
    cy.get("#password").type("12345678");
    cy.get('[data-cy="login-button"]').click();
    cy.wait(2000);
    cy.get('[data-cy="coin-btn"]').click();
    cy.get(
      "#root > div > div > div > div > div > div > div.col-md-8 > div > div:nth-child(1) > div > div"
    ).click();
    cy.get(
      "#root > div > div > div > div > div > div > div.col-md-4 > div > button"
    ).click();
    const imagePath = "slip.png";
    cy.wait(2000);
    cy.get(
      "#root > div > div > div > div > div > div > div.col-md-4 > div > div.mt-2.boxQR > div > input"
    ).attachFile(imagePath);
    // #root > div > div > div > div > div > div > div.col-md-4 > div > div.mt-2.boxQR > div > input
    cy.wait(1000);
    cy.get(
      "#root > div > div > div > div > div > div > div.col-md-4 > div > div.mt-2.boxQR > button"
    ).click();
  });
});
