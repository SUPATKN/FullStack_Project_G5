describe("album create test", () => {
  it("should create album", () => {
    cy.viewport("macbook-16");
    cy.visit("http://localhost:5899/login");

    cy.get("#email").type("aaa@gmail.com");
    cy.get("#password").type("12345678");
    cy.get('[data-cy="login-button"]').click();
    cy.wait(2000);
    cy.get('[data-cy="profile-btn"]').click();
    cy.get('[data-cy="create-btn"]').click();
    cy.get("#formTitle").type("smth");
    cy.get("#formDescription").type("smth");
    cy.get(
      "#root > div > div > div:nth-child(3) > div.fixed.inset-0.bg-black.bg-opacity-50.flex.items-center.justify-center.z-50 > div > div:nth-child(2) > form > div.flex.items-center.justify-center > button"
    ).click();
  });
});
