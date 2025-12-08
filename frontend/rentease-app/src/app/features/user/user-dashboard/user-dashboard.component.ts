import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { BookingService } from '../../../core/services/booking.service';
import { PropertyService } from '../../../core/services/property.service';
import { ImageCompressionService } from '../../../core/services/image-compression.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models/user.model';
import { Booking, BookingStatus } from '../../../core/models/booking.model';
import { Property } from '../../../core/models/property.model';
import { CardComponent } from '../../../shared/components/card.component';
import { ButtonComponent } from '../../../shared/components/button.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader.component';

// User dashboard - profile, bookings and favorites
@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly bookingService = inject(BookingService);
  private readonly propertyService = inject(PropertyService);
  private readonly imageCompressionService = inject(ImageCompressionService);
  private readonly toastService = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly loadingBookings = signal(true);
  protected readonly loadingFavorites = signal(true);
  protected readonly editMode = signal(false);
  protected readonly saving = signal(false);
  protected readonly uploadingPicture = signal(false);
  protected readonly errorMessage = signal('');
  
  protected readonly user = computed(() => this.authService.currentUser());
  protected readonly bookings = signal<Booking[]>([]);
  protected readonly favorites = signal<Property[]>([]);

  protected readonly upcomingBookingsCount = computed(() => {
    const today = new Date();
    return this.bookings().filter(b => 
      new Date(b.check_in_date) > today && b.status !== BookingStatus.CANCELLED
    ).length;
  });

  protected readonly recentBookings = computed(() => {
    return this.bookings().slice(0, 5);
  });

  protected readonly recentFavorites = computed(() => {
    return this.favorites().slice(0, 3);
  });

  protected profileForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
    this.loadUserData();
    this.loadBookings();
    this.loadFavorites();
  }

  private initializeForm(): void {
    const currentUser = this.user();
    this.profileForm = this.fb.group({
      first_name: [currentUser?.first_name || '', Validators.required],
      last_name: [currentUser?.last_name || '', Validators.required],
      email: [currentUser?.email || '', [Validators.required, Validators.email]],
      phone: [currentUser?.phone || '']
    });
  }

  private loadUserData(): void {
    this.userService.getProfile().subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private loadBookings(): void {
    this.bookingService.getUserBookings().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.bookings.set(response.data);
        }
        this.loadingBookings.set(false);
      },
      error: () => {
        this.loadingBookings.set(false);
        this.toastService.error('Failed to load bookings');
      }
    });
  }

  private loadFavorites(): void {
    this.userService.getFavorites().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          // If data is array of property IDs, load full properties
          if (Array.isArray(response.data) && response.data.length > 0) {
            if (typeof response.data[0] === 'string') {
              // Load full property objects for each ID
              this.propertyService.getProperties().subscribe({
                next: (propsResponse: any) => {
                  if (propsResponse.success && propsResponse.data) {
                    const favProps = propsResponse.data.filter((p: Property) => 
                      response.data.includes(p._id || '')
                    );
                    this.favorites.set(favProps);
                  }
                  this.loadingFavorites.set(false);
                }
              });
            } else {
              this.favorites.set(response.data);
              this.loadingFavorites.set(false);
            }
          } else {
            this.loadingFavorites.set(false);
          }
        } else {
          this.loadingFavorites.set(false);
        }
      },
      error: () => {
        this.loadingFavorites.set(false);
        this.toastService.error('Failed to load favorites');
      }
    });
  }

  protected enableEditMode(): void {
    this.editMode.set(true);
    this.initializeForm(); // Reset form with current values
  }

  protected cancelEdit(): void {
    this.editMode.set(false);
    this.errorMessage.set('');
    this.initializeForm();
  }

  protected saveProfile(): void {
    if (!this.profileForm.valid) return;

    this.saving.set(true);
    this.errorMessage.set('');

    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.editMode.set(false);
          this.toastService.success('Profile updated successfully!');
        } else {
          this.errorMessage.set(response.message || 'Failed to update profile');
          this.toastService.error('Failed to update profile');
        }
        this.saving.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Failed to update profile');
        this.saving.set(false);
        this.toastService.error('Failed to update profile');
      }
    });
  }

  protected async onProfilePictureSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.uploadingPicture.set(true);

    try {
      // Compress image before upload
      const compressedFile = await this.imageCompressionService.compressImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 500
      });

      this.userService.uploadProfilePicture(compressedFile).subscribe({
        next: (response) => {
          if (response.success) {
            // Profile picture updated, refresh user data
            this.loadUserData();
            this.toastService.success('Profile picture updated successfully!');
          } else {
            this.toastService.error('Failed to upload profile picture');
          }
          this.uploadingPicture.set(false);
        },
        error: () => {
          this.uploadingPicture.set(false);
          this.toastService.error('Failed to upload image. Please try a smaller file.');
        }
      });
    } catch (error) {
      this.uploadingPicture.set(false);
      this.toastService.error('Failed to process image. Please try a smaller file.');
    }
  }
}

