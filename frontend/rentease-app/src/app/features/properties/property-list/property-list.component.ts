import { Component, inject, signal, computed, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PropertyService } from '../../../core/services/property.service';
import { ToastService } from '../../../core/services/toast.service';
import { Property, PropertyType } from '../../../core/models/property.model';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent } from '../../../shared/components/card.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader.component';

// Property list page - browse and search properties
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
  templateUrl: './property-list.component.html',
  styleUrl: './property-list.component.css'
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

