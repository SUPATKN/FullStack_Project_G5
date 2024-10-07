describe("open website", () => {
  it("passes", () => {
    const url = Cypress.env("FRONTEND_URL");
    cy.visit(url);
    cy.viewport("macbook-16");
    cy.wait(200);
    cy.viewport("macbook-15");
    cy.wait(200);
    cy.viewport("macbook-13");
    cy.wait(200);
    cy.viewport("macbook-11");
    cy.wait(200);
    cy.viewport("iphone-xr");
    cy.wait(200);
    cy.viewport("iphone-se2");
    cy.wait(200);
    cy.viewport("iphone-8");
    cy.wait(200);
    cy.viewport("ipad-mini");
    cy.wait(200);
    cy.viewport("ipad-mini", "landscape");
    cy.wait(200);
    cy.viewport("ipad-2", "landscape");
    cy.wait(200);
  });
});
