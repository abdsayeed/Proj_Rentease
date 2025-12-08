// Import Cypress commands
import './commands';

// Import cypress-axe for accessibility testing
import 'cypress-axe';

// Prevent Cypress from failing tests on uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  return false;
});

// Add custom viewport sizes
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport('iphone-x');
});

Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport('ipad-2');
});

Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1920, 1080);
});
