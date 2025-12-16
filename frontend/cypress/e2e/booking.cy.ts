describe('Booking Flow', () => {
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

  describe('Booking Wizard', () => {
    beforeEach(() => {
      cy.visit('/bookings/new?propertyId=mock-id&checkIn=2025-12-20&checkOut=2025-12-25&guests=2');
    });

    it('should display booking wizard with 4 steps', () => {
      cy.get('[data-test="step"]').should('have.length', 4);
    });

    it('should show property details in step 1', () => {
      cy.get('[data-test="property-summary"]').should('be.visible');
      cy.get('[data-test="booking-details"]').should('be.visible');
      cy.contains('Check-in').should('be.visible');
      cy.contains('Check-out').should('be.visible');
    });

    it('should navigate to guest information step', () => {
      cy.contains('button', 'Next').click();

      cy.get('[data-test="step"]').eq(1).should('have.class', 'current');
      cy.contains('Guest Information').should('be.visible');
    });

    it('should dynamically add/remove guests', () => {
      // Go to guest info step
      cy.contains('button', 'Next').click();

      // Should have 2 guest forms (based on query param guests=2)
      cy.get('[data-test="guest-form"]').should('have.length', 2);

      // Try to add another guest
      cy.contains('button', 'Add Another Guest').click();
      cy.get('[data-test="guest-form"]').should('have.length', 3);

      // Remove a guest
      cy.get('[data-test="guest-form"]').last().within(() => {
        cy.contains('button', 'Remove Guest').click();
      });
      cy.get('[data-test="guest-form"]').should('have.length', 2);
    });

    it('should validate guest information', () => {
      cy.contains('button', 'Next').click();

      // Try to proceed without filling guest info
      cy.contains('button', 'Next').should('be.disabled');

      // Fill in first guest
      cy.get('[data-test="guest-form"]').first().within(() => {
        cy.get('#name-0').type('John Doe');
        cy.get('#email-0').type('john@example.com');
        cy.get('#phone-0').type('+1234567890');
        cy.get('#age-0').type('30');
      });

      // Fill in second guest
      cy.get('[data-test="guest-form"]').eq(1).within(() => {
        cy.get('#name-1').type('Jane Doe');
        cy.get('#email-1').type('jane@example.com');
        cy.get('#phone-1').type('+9876543210');
        cy.get('#age-1').type('28');
      });

      // Next button should now be enabled
      cy.contains('button', 'Next').should('not.be.disabled');
    });

    it('should show payment step', () => {
      // Fill guest info and proceed
      cy.contains('button', 'Next').click();
      
      cy.get('[data-test="guest-form"]').each(($form, index) => {
        cy.wrap($form).within(() => {
          cy.get(`#name-${index}`).type(`Guest ${index + 1}`);
          cy.get(`#email-${index}`).type(`guest${index + 1}@example.com`);
          cy.get(`#phone-${index}`).type('+1234567890');
          cy.get(`#age-${index}`).type('25');
        });
      });

      cy.contains('button', 'Next').click();

      // Should show payment form
      cy.contains('Payment Information').should('be.visible');
      cy.get('#card-name').should('be.visible');
      cy.get('#card-number').should('be.visible');
    });

    it('should calculate total price correctly', () => {
      cy.get('[data-test="total-price"]').invoke('text').then((text) => {
        const total = parseInt(text.replace(/[^0-9]/g, ''));
        expect(total).to.be.greaterThan(0);
      });
    });

    it('should submit booking and show confirmation', () => {
      // Complete all steps
      // Step 1: Review
      cy.contains('button', 'Next').click();

      // Step 2: Guest Info
      cy.get('[data-test="guest-form"]').each(($form, index) => {
        cy.wrap($form).within(() => {
          cy.get(`#name-${index}`).type(`Guest ${index + 1}`);
          cy.get(`#email-${index}`).type(`guest${index + 1}@example.com`);
          cy.get(`#phone-${index}`).type('+1234567890');
          cy.get(`#age-${index}`).type('25');
        });
      });
      cy.contains('button', 'Next').click();

      // Step 3: Payment
      cy.get('#card-name').type('John Doe');
      cy.get('#card-number').type('4111111111111111');
      cy.get('#expiry').type('12/25');
      cy.get('#cvv').type('123');
      
      cy.contains('button', 'Complete Booking').click();

      // Step 4: Confirmation
      cy.contains('Booking Confirmed').should('be.visible');
      cy.get('[data-test="booking-reference"]').should('be.visible');
    });
  });

  describe('Unauthenticated Access', () => {
    it('should redirect to login when not authenticated', () => {
      cy.clearLocalStorage();
      cy.visit('/bookings/new?propertyId=mock-id');

      cy.url().should('include', '/auth/login');
      cy.url().should('include', 'returnUrl');
    });
  });
});
