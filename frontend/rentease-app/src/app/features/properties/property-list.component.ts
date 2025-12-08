import { Component, inject, signal, computed, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PropertyService } from '../../core/services/property.service';
import { ToastService } from '../../core/services/toast.service';
import { Property, PropertyType } from '../../core/models/property.model';
import { ButtonComponent } from '../../shared/components/button.component';
import { CardComponent } from '../../shared/components/card.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader.component';

/**
 * PropertyListComponent - Browse and search properties
 * 
 * CRITICAL IMPLEMENTATION: RxJS-Signal Hybrid Pattern
 * - RxJS debounceTime for async user input
 * - Signal computed() for sync filtering
 * - Client-side pagination
 * 
 * Features:
 * - Search with debouncing (300ms)
 * - Type filtering
 * - Client-side pagination
 * - Loading states with skeleton loaders
 * - Responsive grid layout
 */
@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    SkeletonLoaderComponent
  ],
  template: `
    <div class="property-list-container">
      <!-- Header -->
      <div class="header">
        <h1>Browse Properties</h1>
        <p>Find your perfect rental home</p>
      </div>

      <!-- Search and Filters -->
      <div class="search-section">
        <div class="search-bar">
          <input
            type="text"
            [formControl]="searchControl"
            placeholder="Search by title, city, or description..."
            class="search-input">
          <span class="search-icon">🔍</span>
        </div>

        <div class="filters">
          <select [formControl]="typeControl" class="filter-select">
            <option value="">All Types</option>
            <option [value]="PropertyType.APARTMENT">Apartment</option>
            <option [value]="PropertyType.HOUSE">House</option>
            <option [value]="PropertyType.CONDO">Condo</option>
            <option [value]="PropertyType.STUDIO">Studio</option>
            <option [value]="PropertyType.VILLA">Villa</option>
          </select>

          <select [formControl]="sortControl" class="filter-select">
            <option value="created_at">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <!-- Results Count -->
      <div class="results-info">
        <p>
          Showing {{ paginatedProperties().length }} of {{ filteredProperties().length }} properties
        </p>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="property-grid">
          <app-skeleton-loader variant="card" [repeat]="6" />
        </div>
      }

      <!-- Properties Grid -->
      @else if (paginatedProperties().length > 0) {
        <div class="property-grid">
          @for (property of paginatedProperties(); track property._id) {
            <app-card [hoverable]="true" [hasHeader]="false" [hasFooter]="true">
              <div body>
                <!-- Property Image -->
                <div class="property-image">
                  @if (property.images && property.images.length > 0) {
                    <img [src]="property.images[0]" [alt]="property.title">
                  } @else {
                    <div class="no-image">🏠</div>
                  }
                  <span class="property-type">{{ property.type }}</span>
                </div>

                <!-- Property Details -->
                <div class="property-content">
                  <h3 class="property-title">{{ property.title }}</h3>
                  <p class="property-location">
                    📍 {{ property.location.city }}, {{ property.location.state }}
                  </p>
                  <p class="property-description">
                    {{ property.description | slice:0:100 }}...
                  </p>

                  <div class="property-features">
                    <span class="feature">🛏️ {{ property.bedrooms }} Beds</span>
                    <span class="feature">🚿 {{ property.bathrooms }} Baths</span>
                    <span class="feature">📐 {{ property.square_feet }} sqft</span>
                  </div>

                  <div class="property-price">
                    <span class="price">\${{ property.price }}</span>
                    <span class="period">/month</span>
                  </div>
                </div>
              </div>

              <div footer>
                <app-button
                  variant="primary"
                  size="md"
                  [routerLink]="['/properties', property._id]"
                  class="view-btn">
                  View Details
                </app-button>
              </div>
            </app-card>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="pagination">
            <app-button
              variant="outline"
              size="sm"
              [disabled]="currentPage() === 1"
              (clicked)="previousPage()">
              ← Previous
            </app-button>

            <span class="page-info">
              Page {{ currentPage() }} of {{ totalPages() }}
            </span>

            <app-button
              variant="outline"
              size="sm"
              [disabled]="currentPage() === totalPages()"
              (clicked)="nextPage()">
              Next →
            </app-button>
          </div>
        }
      }

      <!-- Empty State -->
      @else {
        <div class="empty-state">
          <span class="empty-icon">🔍</span>
          <h2>No properties found</h2>
          <p>Try adjusting your search or filters</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .property-list-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem;
      color: var(--text-primary, #1f2937);
    }

    .header p {
      font-size: 1.125rem;
      color: var(--text-secondary, #6b7280);
      margin: 0;
    }

    .search-section {
      background: var(--bg-surface, #ffffff);
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .search-bar {
      position: relative;
      margin-bottom: 1rem;
    }

    .search-input {
      width: 100%;
      padding: 1rem 3rem 1rem 1rem;
      border: 1px solid var(--border-color, #d1d5db);
      border-radius: 0.5rem;
      font-size: 1rem;
    }

    .search-icon {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.25rem;
      pointer-events: none;
    }

    .filters {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filter-select {
      flex: 1;
      min-width: 200px;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color, #d1d5db);
      border-radius: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
    }

    .results-info {
      margin-bottom: 1.5rem;
      color: var(--text-secondary, #6b7280);
    }

    .property-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .property-image {
      position: relative;
      height: 200px;
      overflow: hidden;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }

    .property-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-image {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-muted, #f3f4f6);
      font-size: 4rem;
    }

    .property-type {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: #3b82f6;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .property-content {
      flex: 1;
    }

    .property-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 0.5rem;
      color: var(--text-primary, #1f2937);
    }

    .property-location {
      color: var(--text-secondary, #6b7280);
      font-size: 0.875rem;
      margin: 0 0 0.75rem;
    }

    .property-description {
      color: var(--text-secondary, #6b7280);
      line-height: 1.6;
      margin: 0 0 1rem;
    }

    .property-features {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .feature {
      font-size: 0.875rem;
      color: var(--text-secondary, #6b7280);
    }

    .property-price {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
    }

    .price {
      font-size: 1.875rem;
      font-weight: 700;
      color: #3b82f6;
    }

    .period {
      color: var(--text-secondary, #6b7280);
    }

    .view-btn {
      width: 100%;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
    }

    .page-info {
      color: var(--text-secondary, #6b7280);
      font-weight: 500;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 1rem;
    }

    .empty-state h2 {
      font-size: 1.5rem;
      color: var(--text-primary, #1f2937);
      margin: 0 0 0.5rem;
    }

    .empty-state p {
      color: var(--text-secondary, #6b7280);
      margin: 0;
    }

    @media (max-width: 640px) {
      .property-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PropertyListComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  protected readonly PropertyType = PropertyType;

  // Form controls
  protected readonly searchControl = new FormControl('');
  protected readonly typeControl = new FormControl('');
  protected readonly sortControl = new FormControl('created_at');

  // RxJS Observable → Signal conversion (CRITICAL PATTERN)
  private readonly searchQuery$ = this.searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged()
  );
  protected readonly searchQuery = toSignal(this.searchQuery$, { initialValue: '' });
  protected readonly selectedType = toSignal(this.typeControl.valueChanges, { initialValue: '' });
  protected readonly sortBy = toSignal(this.sortControl.valueChanges, { initialValue: 'created_at' });

  // Signals
  protected readonly loading = signal(true);
  protected readonly allProperties = signal<Property[]>([]);
  protected readonly currentPage = signal(1);
  private readonly itemsPerPage = 6;

  // Computed Signals (derived state)
  protected readonly filteredProperties = computed(() => {
    let properties = this.allProperties();
    const query = this.searchQuery()?.toLowerCase() || '';
    const type = this.selectedType() || '';

    // Search filter
    if (query) {
      properties = properties.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.location.city.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (type) {
      properties = properties.filter(p => p.type === type);
    }

    // Sorting
    const sortValue = this.sortBy() || 'created_at';
    properties = [...properties].sort((a, b) => {
      if (sortValue === 'price_asc') return a.price - b.price;
      if (sortValue === 'price_desc') return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return properties;
  });

  protected readonly totalPages = computed(() => 
    Math.ceil(this.filteredProperties().length / this.itemsPerPage)
  );

  protected readonly paginatedProperties = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProperties().slice(start, end);
  });

  ngOnInit(): void {
    this.loadProperties();
  }

  private readonly toastService = inject(ToastService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private loadProperties(): void {
    this.propertyService.getProperties().subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success && response.data) {
          this.allProperties.set(response.data);
        }
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Failed to load properties:', error);
        this.toastService.error('Failed to load properties. Please refresh the page.');
      }
    });
  }

  protected nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
      if (this.isBrowser) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  protected previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      if (this.isBrowser) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }
}
