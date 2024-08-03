import 'cypress-file-upload';

describe('frontend', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5899/');
  });

  it('should navigate to the Gallery page when Gallery link is clicked', () => {
    cy.get('[data-cy="gallery-link"]').click();
    cy.url().should('include', '/');
      cy.wait(2000);
  });
  

  it('should navigate to the Creator page when Creator link is clicked', () => {
    cy.get('[data-cy="creator-link"]').click();
    cy.url().should('include', '/creator');
      cy.wait(2000);

  });

  it('should navigate to the Instructor page when Instructor link is clicked', () => {
    cy.get('[data-cy="instructor-link"]').click();
    cy.url().should('include', '/instructor');
      cy.wait(2000);

  });

  it('should navigate to the Upload page when Start Upload button is clicked', () => {
    cy.get('[data-cy="start-upload-button"]').click();
    cy.url().should('include', '/upload');

    const imagePath = 'image1.png';
    cy.wait(2000);
    cy.get('[data-cy="file-input"]').attachFile(imagePath);
    cy.wait(1000);
    cy.get('[data-cy="upload-button"]').click();
    cy.wait(1000);
    cy.get('[data-cy="success-message"]').should('contain', 'File uploaded successfully!');
    cy.wait(1000);
    cy.get('[data-cy^="photo-"]').should('exist');
    cy.wait(1000);
    cy.get('[data-cy="gallery-link"]').click();
    cy.url().should('include', '/');
    cy.wait(2000);
    cy.get('[data-cy="start-upload-button"]').click();
    cy.url().should('include', '/upload');
    cy.wait(2000);
    cy.get('[data-cy^="photo-"]').first().then($photo => {
      const photoId = $photo.attr('data-cy').split('-')[1];
      cy.get(`[data-cy="delete-button-${photoId}"]`).click();
    });
    cy.wait(1000);
    cy.get('[data-cy="success-message"]').should('contain', 'File deleted successfully!');
    cy.wait(1000);
    cy.get('[data-cy^="photo-"]').should('not.exist');
    cy.wait(1000);
  });
});
