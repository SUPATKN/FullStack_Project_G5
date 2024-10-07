import "cypress-file-upload";
const url = Cypress.env("FRONTEND_URL");

describe("frontend", () => {
  beforeEach(() => {
    cy.visit(url);
  });
  // it("login", () => {
  //   cy.get(
  //     "#root > div > nav > div > div.nav-actions > div > a.nav-link.login"
  //   ).click();
  //   cy.url().should("include", "/login");
  //   cy.wait(2000);
  //   cy.get("#email").type("aaa@gmail.com");
  //   cy.get("#password").type("12345678");
  //   cy.get('[data-cy="login-button"]').click();
  //   cy.url().should("include", "/");
  // });

  //admin login
  // it("login", () => {
  //   cy.get(
  //     "#root > div > nav > div > div.nav-actions > div > a.nav-link.login"
  //   ).click();
  //   cy.url().should("include", "/login");
  //   cy.wait(2000);
  //   cy.get("#email").type("admin@admin.com");
  //   cy.get("#password").type("password123");
  //   cy.get('[data-cy="login-button"]').click();
  //   cy.url().should("include", "/");
  // });

  //login google
  // it("google oauth login", () => {
  //   cy.get(
  //     "#root > div > nav > div > div.nav-actions > div > a.nav-link.login"
  //   ).click();
  //   cy.url().should("include", "/login");
  //   cy.wait(2000);
  //   cy.get('[data-cy="google-login-button"]').click();
  //   cy.get(
  //     "#yDmH0d > div.gfM9Zd > div.tTmh9.NQ5OL > div.SQNfcc.WbALBb > div > div > div.Anixxd > div > div > div.HvrJge > form > span > section > div > div > div > div > ul > li:nth-child(2) > div"
  //   ).click();
  // });

  //sign-up
  // it("sign up", () => {
  //   cy.get('[data-cy="signup-button"]').click();
  //   cy.get("#username").type("ccc");
  //   cy.get("#email").type("ccc@gmail.com");
  //   cy.get("#password").type("12345678");
  //   cy.get("#confirmPassword").type("12345678");
  //   cy.get('[data-cy="confirm-button"]').click();
  // });

  // it("should navigate to the Home page when Home link is clicked", () => {
  //   cy.get(
  //     "#root > div > nav > div > div.navbar-collapse > ul > li:nth-child(1) > a"
  //   ).click();
  //   cy.url().should("include", "/home");
  //   cy.wait(2000);
  // });

  // it("should navigate to the Gallery page when Gallery link is clicked", () => {
  //   cy.get(
  //     "#root > div > nav > div > div.navbar-collapse > ul > li.active > a"
  //   ).click();
  //   cy.url().should("include", "/");
  //   cy.wait(2000);
  //   cy.get("#root > div > div > h3").should("contain", "GALLERY");
  // });

  // it("should navigate to the Creator page when Creator link is clicked", () => {
  //   cy.get(
  //     "#root > div > nav > div > div.navbar-collapse > ul > li:nth-child(3) > a"
  //   ).click();
  //   cy.get("#email").type("aaa@gmail.com");
  //   cy.get("#password").type("12345678");
  //   cy.get('[data-cy="login-button"]').click();
  //   cy.wait(2000);
  //   cy.get(
  //     "#root > div > nav > div > div.navbar-collapse > ul > li:nth-child(3) > a"
  //   ).click();
  //   cy.url().should("include", "/creator");
  //   cy.wait(2000);
  // });

  // it("should navigate to the Instructor page when Instructor link is clicked", () => {
  //   cy.get(
  //     "#root > div > nav > div > div.navbar-collapse > ul > li:nth-child(4) > a"
  //   ).click();
  //   cy.get("#email").type("aaa@gmail.com");
  //   cy.get("#password").type("12345678");
  //   cy.get('[data-cy="login-button"]').click();
  //   cy.wait(2000);
  //   cy.get(
  //     "#root > div > nav > div > div.navbar-collapse > ul > li:nth-child(4) > a"
  //   ).click();
  //   cy.url().should("include", "/instructor");
  //   cy.wait(2000);
  // });

  //Upload
  // it("should navigate to the Upload page when Start Upload link is clicked", () => {
  //   cy.get('[data-cy="start-upload"]').click();
  //   cy.get("#email").type("bbb@gmail.com");
  //   cy.get("#password").type("12345678");
  //   cy.get('[data-cy="login-button"]').click();
  //   cy.wait(2000);
  //   cy.get('[data-cy="start-upload"]').click();
  //   cy.url().should("include", "/upload");
  //   const imagePath = "img1.png";
  //   cy.wait(2000);
  //   cy.get('[data-cy="file-input"]').attachFile(imagePath);
  //   cy.wait(1000);
  //   cy.get("#formTitle").type("img1");
  //   cy.get("#formDescription").type("hehe");
  //   cy.get("#formIsFree").click();
  //   cy.get("#formPrice").type("1");
  //   cy.get('[data-cy="upload-button"]').click();
  //   cy.get('[data-cy="success-message"]').should(
  //     "contain",
  //     "File uploaded successfully!"
  //   );
  // });

  //Delete
  // it("should navigate to the Delete page when Delete link is clicked", () => {
  //   cy.get(
  //     "#root > div > nav > div > div.nav-actions > div > a.nav-link.login"
  //   ).click();
  //   cy.get("#email").type("aaa@gmail.com");
  //   cy.get("#password").type("12345678");
  //   cy.get('[data-cy="login-button"]').click();
  //   cy.wait(2000);
  //   cy.get('[data-cy="profile"]').click();
  //   cy.get('[data-cy="edit-button"]').click();
  //   cy.get('[data-cy="delete-button"]').click();
  // });

  //Create album
  // it("should navigate to the Creat album page when Create alum link is clicked", () => {
  //   cy.get(
  //     "#root > div > nav > div > div.nav-actions > div > a.nav-link.login"
  //   ).click();
  //   cy.get("#email").type("aaa@gmail.com");
  //   cy.get("#password").type("12345678");
  //   cy.get('[data-cy="login-button"]').click();
  //   cy.wait(2000);
  //   cy.get('[data-cy="profile"]').click();
  //   cy.get('[data-cy="create-album-button"]').click();
  //   cy.get("#formTitle").type("Animals");
  //   cy.get("#formDescription").type("Cute Animals");
  //   cy.get(
  //     "#root > div > div > div:nth-child(3) > div.fixed.inset-0.bg-black.bg-opacity-50.flex.items-center.justify-center.z-50 > div > div:nth-child(2) > form > div.flex.items-center.justify-center > button"
  //   ).click();
  // });

  //Add to album
  // it("should navigate to the Add to album page when Add to album link is clicked", () => {
  //   cy.get(
  //     "#root > div > nav > div > div.nav-actions > div > a.nav-link.login"
  //   ).click();
  //   cy.get("#email").type("aaa@gmail.com");
  //   cy.get("#password").type("12345678");
  //   cy.get('[data-cy="login-button"]').click();
  //   cy.wait(2000);
  //   cy.get('[data-cy="profile"]').click();
  //   cy.get('[data-cy="edit-button"]').click();
  //   cy.get('[data-cy="add to album-button"]').click();
  //   cy.get(
  //     "body > div.fade.modal.show > div > div > div.modal-body > div > button"
  //   ).click();
  //   cy.get(
  //     "body > div.fade.modal.show > div > div > div.modal-footer > button.btn.btn-primary"
  //   ).click();
  // });

  // //Delete album
  // it("should delete album", () => {
  //   cy.get(
  //     "#root > div > nav > div > div.nav-actions > div > a.nav-link.login"
  //   ).click();
  //   cy.get("#email").type("aaa@gmail.com");
  //   cy.get("#password").type("12345678");
  //   cy.get('[data-cy="login-button"]').click();
  //   cy.wait(2000);
  //   cy.get('[data-cy="profile"]').click();
  //   cy.get('[data-cy="delete-album-button"]').click();
  // });

  //Top up
  // it("should navigate to top up page", () => {
  //   cy.get(
  //     "#root > div > nav > div > div.nav-actions > div > a.nav-link.login"
  //   ).click();
  //   cy.get("#email").type("aaa@gmail.com");
  //   cy.get("#password").type("12345678");
  //   cy.get('[data-cy="login-button"]').click();
  //   cy.wait(2000);
  //   cy.get('[data-cy="coin"]').click();
  //   cy.get(
  //     "#root > div > div > div > div > div > div > div.col-md-8 > div > div:nth-child(1) > div > div"
  //   ).click();
  //   cy.get(
  //     "#root > div > div > div > div > div > div > div.col-md-4 > div > button"
  //   ).click();
  // });

  //Add to cart
  // it("should add to cart", () => {
  //   cy.get(
  //     "#root > div > nav > div > div.nav-actions > div > a.nav-link.login"
  //   ).click();
  //   cy.get("#email").type("aaa@gmail.com");
  //   cy.get("#password").type("12345678");
  //   cy.get('[data-cy="login-button"]').click();
  //   cy.wait(2000);
  //   cy.get(
  //     "#root > div > nav > div > div.navbar-collapse > ul > li.active > a"
  //   ).click();
  //   cy.url().should("include", "/");
  //   cy.wait(2000);
  //   cy.get(
  //     "#root > div > div > div.row > div > div > div:nth-child(2) > button"
  //   ).click();
  //   cy.get('[data-cy="cart-button"]').click();
  //   cy.get("#root > div > div > div.Cart > div.checkout.w-100.mb-2").click();
  // });

  //payment slips
  it("approve payment", () => {
    cy.get(
      "#root > div > nav > div > div.nav-actions > div > a.nav-link.login"
    ).click();
    cy.url().should("include", "/login");
    cy.wait(2000);
    cy.get("#email").type("admin@admin.com");
    cy.get("#password").type("password123");
    cy.get('[data-cy="login-button"]').click();
    cy.wait(4000);
    cy.url().should("include", "/");
    cy.get('[data-cy="approve-btn"]').click();
    cy.get('[data-cy="reject-btn"]').click(); //reject
  });

  //tag
  // it("should navigate to tag management", () => {
  //   cy.get(
  //     "#root > div > nav > div > div.nav-actions > div > a.nav-link.login"
  //   ).click();
  //   cy.url().should("include", "/login");
  //   cy.wait(2000);
  //   cy.get("#email").type("admin@admin.com");
  //   cy.get("#password").type("password123");
  //   cy.get('[data-cy="login-button"]').click();
  //   cy.wait(4000);
  //   cy.get('[data-cy="tag-btn"]').click();
  //   cy.get("#tagName").type("object");
  //   cy.get('[data-cy="add-btn"]').click();
  //   cy.wait(2000);
  // });

  //users
  // it("should navigate to users", () => {
  //   cy.get(
  //     "#root > div > nav > div > div.nav-actions > div > a.nav-link.login"
  //   ).click();
  //   cy.url().should("include", "/login");
  //   cy.wait(2000);
  //   cy.get("#email").type("admin@admin.com");
  //   cy.get("#password").type("password123");
  //   cy.get('[data-cy="login-button"]').click();
  //   cy.wait(4000);
  //   cy.get('[data-cy="users-btn"]').click();
  // });

  //order history
  // it("should navigate to order history", () => {
  //   cy.get(
  //     "#root > div > nav > div > div.nav-actions > div > a.nav-link.login"
  //   ).click();
  //   cy.url().should("include", "/login");
  //   cy.wait(2000);
  //   cy.get("#email").type("admin@admin.com");
  //   cy.get("#password").type("password123");
  //   cy.get('[data-cy="login-button"]').click();
  //   cy.wait(4000);
  //   cy.get('[data-cy="order-btn"]').click();
  // });

  //transaction history
  // it("should navigate to transaction history", () => {
  //   cy.get(
  //     "#root > div > nav > div > div.nav-actions > div > a.nav-link.login"
  //   ).click();
  //   cy.url().should("include", "/login");
  //   cy.wait(2000);
  //   cy.get("#email").type("admin@admin.com");
  //   cy.get("#password").type("password123");
  //   cy.get('[data-cy="login-button"]').click();
  //   cy.wait(4000);
  //   cy.get('[data-cy="trans-btn"]').click();
  // });
});
