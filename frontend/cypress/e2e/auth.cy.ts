describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
    cy.visit('/');
  });

  describe('User Registration', () => {
    it('should successfully register a new customer', () => {
      cy.visit('/auth/register');

      // Fill in registration form
      cy.get('#first_name').type('John');
      cy.get('#last_name').type('Doe');
      cy.get('#email').type(`testuser${Date.now()}@example.com`);
      cy.get('#phone').type('+1234567890');
      cy.get('#password').type('Test123456');
      cy.get('#confirm_password').type('Test123456');

      // Select customer role
      cy.contains('button', 'Customer').click();

      // Submit form
      cy.contains('button', 'Create Account').click();

      // Should redirect to home page
      cy.url().should('eq', `${Cypress.config().baseUrl}/`);
      
      // Should show user is logged in
      cy.contains('Welcome').should('be.visible');
    });

    it('should show validation errors for invalid inputs', () => {
      cy.visit('/auth/register');

      // Try to submit empty form
      cy.contains('button', 'Create Account').click();

      // Should show validation errors
      cy.contains('First name is required').should('be.visible');
      cy.contains('Last name is required').should('be.visible');
      cy.contains('Valid email is required').should('be.visible');
    });

    it('should show error for mismatched passwords', () => {
      cy.visit('/auth/register');

      cy.get('#password').type('Password123');
      cy.get('#confirm_password').type('DifferentPassword123');
      cy.get('#confirm_password').blur();

      cy.contains('Passwords do not match').should('be.visible');
    });
  });

  describe('User Login', () => {
    it('should successfully login with valid credentials', () => {
      cy.visit('/auth/login');

      cy.get('#email').type('test@example.com');
      cy.get('#password').type('password123');

      cy.contains('button', 'Login').click();

      // Should redirect to home or dashboard
      cy.url().should('not.include', '/auth/login');
    });

    it('should show error message for invalid credentials', () => {
      cy.visit('/auth/login');

      cy.get('#email').type('wrong@example.com');
      cy.get('#password').type('wrongpassword');

      cy.contains('button', 'Login').click();

      // Should show error message
      cy.get('.error-message').should('be.visible');
    });

    it('should not allow access to login page when already authenticated', () => {
      // Mock authenticated state
      cy.window().then((win) => {
        win.localStorage.setItem('access_token', 'mock-token');
        win.localStorage.setItem('user', JSON.stringify({
          _id: '123',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'CUSTOMER'
        }));
      });

      cy.visit('/auth/login');

      // Should redirect away from login page
      cy.url().should('not.include', '/auth/login');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      // Setup authenticated state
      cy.window().then((win) => {
        win.localStorage.setItem('access_token', 'mock-token');
        win.localStorage.setItem('user', JSON.stringify({
          _id: '123',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'CUSTOMER'
        }));
      });
    });

    it('should logout user and clear local storage', () => {
      cy.visit('/');

      // Click logout button
      cy.contains('button', 'Logout').click();

      // Should clear localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('access_token')).to.be.null;
        expect(win.localStorage.getItem('user')).to.be.null;
      });

      // Should redirect to home
      cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    });
  });
});
