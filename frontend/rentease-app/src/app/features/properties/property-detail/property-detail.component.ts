import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { Property, PropertyStatus } from '../../../core/models/property.model';
import { CardComponent } from '../../../shared/components/card.component';
import { ButtonComponent } from '../../../shared/components/button.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader.component';
import { FormsModule } from '@angular/forms';

// Property detail page - shows full property info and rental form
@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CardComponent,
    ButtonComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.css'
})
export class PropertyDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly propertyService = inject(PropertyService);
  private readonly bookingService = inject(BookingService);
  private readonly userService = inject(UserService);
  protected readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly property = signal<Property | null>(null);
  protected readonly currentImageIndex = signal(0);
  protected readonly favoriteLoading = signal(false);
  protected readonly isFavorite = signal(false);
  protected readonly checkingAvailability = signal(false);
  protected readonly availabilityMessage = signal('');
  protected readonly isAvailable = signal(false);

  protected checkInDate = '';
  protected checkOutDate = '';
  protected numberOfGuests: number = 1;
  protected readonly minDate = new Date().toISOString().split('T')[0];
  
  // Export enum for template access
  protected readonly PropertyStatus = PropertyStatus;

  protected readonly currentImage = computed(() => {
    const prop = this.property();
    if (!prop || prop.images.length === 0) return '';
    return prop.images[this.currentImageIndex()];
  });

  // Calculate lease duration in days
  protected getLeaseDays(): number {
    if (!this.checkInDate || !this.checkOutDate) return 0;
    const start = new Date(this.checkInDate);
    const end = new Date(this.checkOutDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }

  // Calculate lease duration in months (approximate)
  protected getLeaseMonths(): number {
    return Math.round(this.getLeaseDays() / 30);
  }

  // For backward compatibility with template
  protected readonly numberOfNights = computed(() => {
    return 0; // This is now handled by getLeaseDays()
  });

  protected readonly hasValidRating = computed(() => {
    const prop = this.property();
    return prop?.ratings && prop.ratings.average_rating > 0;
  });

  // Calculate total due at move-in (first month rent + security deposit)
  protected getTotalDueAtMoveIn(): number {
    const prop = this.property();
    if (!prop) return 0;
    // First month's rent + security deposit (1 month)
    return prop.price * 2;
  }

  // Keep for backward compatibility but now use method
  protected readonly totalPrice = computed(() => {
    const prop = this.property();
    if (!prop) return 0;
    return prop.price * 2;
  });

  ngOnInit(): void {
    const propertyId = this.route.snapshot.paramMap.get('id');
    if (!propertyId) {
      this.errorMessage.set('Property ID not found');
      this.loading.set(false);
      return;
    }

    this.loadProperty(propertyId);
    this.checkIfFavorite(propertyId);
  }

  private loadProperty(id: string): void {
    this.propertyService.getPropertyById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.property.set(response.data);
        } else {
          this.errorMessage.set(response.message || 'Failed to load property');
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Failed to load property');
        this.loading.set(false);
      }
    });
  }

  private checkIfFavorite(propertyId: string): void {
    if (!this.authService.isAuthenticated()) return;

    this.userService.getFavorites().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          // data is string[] of property IDs
          this.isFavorite.set(response.data.some((fav: string) => fav === propertyId));
        }
      }
    });
  }

  protected nextImage(): void {
    const prop = this.property();
    if (!prop) return;
    const newIndex = (this.currentImageIndex() + 1) % prop.images.length;
    this.currentImageIndex.set(newIndex);
  }

  protected previousImage(): void {
    const prop = this.property();
    if (!prop) return;
    const newIndex = this.currentImageIndex() === 0 
      ? prop.images.length - 1 
      : this.currentImageIndex() - 1;
    this.currentImageIndex.set(newIndex);
  }

  protected selectImage(index: number): void {
    this.currentImageIndex.set(index);
  }

  protected toggleFavorite(): void {
    const prop = this.property();
    if (!prop) return;

    this.favoriteLoading.set(true);
    const isRemoving = this.isFavorite();
    const request = isRemoving
      ? this.userService.removeFavorite(prop._id)
      : this.userService.addFavorite(prop._id);

    request.subscribe({
      next: (response) => {
        if (response.success) {
          this.isFavorite.set(!this.isFavorite());
          this.toastService.success(
            isRemoving ? 'Removed from favorites' : 'Added to favorites successfully!'
          );
        }
        this.favoriteLoading.set(false);
      },
      error: () => {
        this.favoriteLoading.set(false);
        this.toastService.error(
          isRemoving ? 'Failed to remove from favorites' : 'Failed to add to favorites'
        );
      }
    });
  }

  protected checkAvailability(): void {
    const prop = this.property();
    if (!prop || !this.checkInDate || !this.checkOutDate) return;

    this.checkingAvailability.set(true);
    this.bookingService.checkAvailability({
      property_id: prop._id,
      check_in_date: this.checkInDate,
      check_out_date: this.checkOutDate
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.isAvailable.set(response.data.is_available);
          this.availabilityMessage.set(
            response.data.is_available 
              ? '✓ Property is available for these dates!'
              : '✗ Property is not available for these dates. Please try different dates.'
          );
        }
        this.checkingAvailability.set(false);
      },
      error: () => {
        this.availabilityMessage.set('Error checking availability. Please try again.');
        this.checkingAvailability.set(false);
        this.toastService.error('Failed to check availability. Please try again.');
      }
    });
  }

  protected proceedToBooking(): void {
    const prop = this.property();
    if (!prop) return;

    this.router.navigate(['/bookings/new'], {
      queryParams: {
        propertyId: prop._id,
        checkIn: this.checkInDate,
        checkOut: this.checkOutDate,
        guests: this.numberOfGuests
      }
    });
  }
}

