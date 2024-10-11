import "cypress-file-upload";

describe("upload profile pic test", () => {
  it("should upload profile pic", () => {
    cy.viewport("macbook-16");
    cy.visit("http://localhost:5899/login");

    cy.get("#email").type("aaa@gmail.com");
    cy.get("#password").type("12345678");
    cy.get('[data-cy="login-button"]').click();
    cy.wait(2000);
    cy.get('[data-cy="profile-btn"]').click();
    cy.get('[data-cy="upload-btn"]').click();
    const imagePath = "good.jpg";
    cy.wait(2000);
    cy.get('[data-cy="file-input"]').attachFile(imagePath);
    cy.wait(1000);
    cy.get('[data-cy="ok-btn"]').first().click();
  });
});
