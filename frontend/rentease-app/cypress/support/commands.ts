/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to set mobile viewport
       * @example cy.setMobileViewport()
       */
      setMobileViewport(): Chainable<void>;

      /**
       * Custom command to set tablet viewport
       * @example cy.setTabletViewport()
       */
      setTabletViewport(): Chainable<void>;

      /**
       * Custom command to set desktop viewport
       * @example cy.setDesktopViewport()
       */
      setDesktopViewport(): Chainable<void>;

      /**
       * Custom command to login programmatically
       * @example cy.login('user@example.com', 'password')
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Custom command to setup authenticated state
       * @example cy.setupAuth('customer')
       */
      setupAuth(role: 'CUSTOMER' | 'AGENT' | 'ADMIN'): Chainable<void>;
    }
  }
}

// Custom command to login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/auth/login`,
    body: {
      email,
      password
    }
  }).then((response) => {
    window.localStorage.setItem('access_token', response.body.data.access_token);
    window.localStorage.setItem('refresh_token', response.body.data.refresh_token);
    window.localStorage.setItem('user', JSON.stringify(response.body.data.user));
  });
});

// Custom command to setup authenticated state
Cypress.Commands.add('setupAuth', (role: 'CUSTOMER' | 'AGENT' | 'ADMIN') => {
  const mockUser = {
    _id: '123456',
    email: `${role.toLowerCase()}@example.com`,
    first_name: 'Test',
    last_name: 'User',
    role: role,
    phone: '+1234567890',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  cy.window().then((win) => {
    win.localStorage.setItem('access_token', 'mock-access-token');
    win.localStorage.setItem('refresh_token', 'mock-refresh-token');
    win.localStorage.setItem('user', JSON.stringify(mockUser));
  });
});

export {};
