describe("oauth login test", () => {
  it("google oauth login", () => {
    cy.visit("http://localhost:5899/login");
    // cy.get(
    //   "#root > div > nav > div > div.nav-actions > div > a.nav-link.login"
    // ).click();
    cy.url().should("include", "/login");
    cy.wait(2000);
    cy.get('[data-cy="google-login-button"]').click();
    cy.get(
      "#yDmH0d > div.gfM9Zd > div.tTmh9.NQ5OL > div.SQNfcc.WbALBb > div > div > div.Anixxd > div > div > div.HvrJge > form > span > section > div > div > div > div > ul > li:nth-child(2) > div"
    ).click();
  });
});
