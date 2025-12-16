describe('Property Browsing', () => {
  beforeEach(() => {
    cy.visit('/properties');
  });

  describe('Property List', () => {
    it('should display property list on page load', () => {
      cy.get('[data-test="property-card"]').should('have.length.gt', 0);
    });

    it('should search properties by keyword', () => {
      // Type in search box
      cy.get('[data-test="search-input"]').type('apartment');

      // Wait for debounce
      cy.wait(400);

      // Should filter results
      cy.get('[data-test="property-card"]').should('have.length.gt', 0);
    });

    it('should filter properties by type', () => {
      cy.get('[data-test="type-filter"]').select('APARTMENT');

      cy.get('[data-test="property-card"]').each(($el) => {
        cy.wrap($el).should('contain.text', 'APARTMENT');
      });
    });

    it('should sort properties by price', () => {
      cy.get('[data-test="sort-select"]').select('price-asc');

      // Check if prices are in ascending order
      cy.get('[data-test="property-price"]').then(($prices) => {
        const prices = [...$prices].map((el) => 
          parseInt(el.textContent?.replace(/[^0-9]/g, '') || '0')
        );
        
        const sorted = [...prices].sort((a, b) => a - b);
        expect(prices).to.deep.equal(sorted);
      });
    });

    it('should paginate results', () => {
      // Check if pagination exists
      cy.get('[data-test="pagination"]').should('exist');

      // Click next page
      cy.contains('button', 'Next').click();

      // URL should update with page parameter
      cy.url().should('include', 'page=2');
    });
  });

  describe('Property Detail', () => {
    it('should navigate to property detail page', () => {
      cy.get('[data-test="property-card"]').first().click();

      cy.url().should('include', '/properties/');
      cy.get('h1').should('be.visible');
    });

    it('should display property images in carousel', () => {
      cy.visit('/properties/mock-id');

      cy.get('[data-test="main-image"]').should('be.visible');
      
      // Click next image button
      cy.get('[data-test="next-image"]').click();
      
      // Image should change
      cy.get('[data-test="image-counter"]').should('contain', '2');
    });

    it('should show property amenities', () => {
      cy.visit('/properties/mock-id');

      cy.get('[data-test="amenities-section"]').should('exist');
      cy.get('[data-test="amenity"]').should('have.length.gt', 0);
    });

    it('should allow checking availability', () => {
      cy.visit('/properties/mock-id');

      // Set check-in date
      cy.get('#check-in').type('2025-12-20');
      
      // Set check-out date
      cy.get('#check-out').type('2025-12-25');
      
      // Set number of guests
      cy.get('#guests').clear().type('2');

      // Click check availability
      cy.contains('button', 'Check Availability').click();

      // Should show availability message
      cy.get('[data-test="availability-message"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should pass accessibility checks on property list', () => {
      cy.injectAxe();
      cy.checkA11y();
    });

    it('should have proper ARIA labels', () => {
      cy.get('[data-test="search-input"]').should('have.attr', 'aria-label');
      cy.get('[data-test="type-filter"]').should('have.attr', 'aria-label');
    });

    it('should be keyboard navigable', () => {
      // Tab through elements
      cy.get('[data-test="search-input"]').focus().should('be.focused');
      
      // Check that filter is also focusable
      cy.get('[data-test="type-filter"]').focus().should('be.focused');
    });
  });
});
