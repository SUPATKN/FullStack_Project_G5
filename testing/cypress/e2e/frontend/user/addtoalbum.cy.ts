describe("add to album test", () => {
  it("should add to album", () => {
    cy.visit("http://localhost:5899/login");

    cy.get("#email").type("bbb@gmail.com");
    cy.get("#password").type("12345678");
    cy.get('[data-cy="login-button"]').click();

    cy.wait(2000);
    cy.get('[data-cy="profile-btn"]').click();
    cy.get('[data-cy="edit-btn"]').click();
    cy.get('[data-cy="add-btn"]').first().click();
    cy.get(
      "body > div.fade.modal.show > div > div > div.modal-body > div > button"
    ).click();
    cy.get(
      "body > div.fade.modal.show > div > div > div.modal-footer > button.btn.btn-primary"
    ).click();
    cy.get('[data-cy="viewalbum-btn"]').first().click();
  });
});
