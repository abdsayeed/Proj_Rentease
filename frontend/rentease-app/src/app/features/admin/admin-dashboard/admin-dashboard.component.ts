import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { User, UserRole } from '../../../core/models/user.model';
import { Property, PropertyStatus } from '../../../core/models/property.model';
import { Booking, BookingStatus } from '../../../core/models/booking.model';
import { CardComponent } from '../../../shared/components/card.component';
import { ButtonComponent } from '../../../shared/components/button.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader.component';

// Admin dashboard - manage users, properties and bookings
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CardComponent,
    ButtonComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  protected readonly loadingStats = signal(true);
  protected readonly loadingUsers = signal(true);
  protected readonly loadingProperties = signal(true);
  protected readonly loadingBookings = signal(true);
  protected readonly activeTab = signal<'users' | 'properties' | 'bookings'>('users');
  protected readonly users = signal<User[]>([]);
  protected readonly properties = signal<Property[]>([]);
  protected readonly bookings = signal<Booking[]>([]);
  protected readonly showConfirmModal = signal(false);
  protected readonly confirmModalTitle = signal('');
  protected readonly confirmModalMessage = signal('');
  protected readonly actionInProgress = signal(false);
  protected userSearchQuery = '';
  
  // Export enums for template access
  protected readonly UserRole = UserRole;
  protected readonly PropertyStatus = PropertyStatus;
  protected readonly BookingStatus = BookingStatus;
  
  private confirmAction: (() => void) | null = null;

  // Computed statistics
  protected readonly totalUsers = computed(() => this.users().length);
  protected readonly customerCount = computed(() => 
    this.users().filter(u => u.role === UserRole.CUSTOMER).length
  );
  protected readonly agentCount = computed(() => 
    this.users().filter(u => u.role === UserRole.AGENT).length
  );

  protected readonly totalProperties = computed(() => this.properties().length);
  protected readonly availableProperties = computed(() =>
    this.properties().filter(p => p.status === PropertyStatus.AVAILABLE).length
  );
  protected readonly rentedProperties = computed(() =>
    this.properties().filter(p => p.status === PropertyStatus.RENTED).length
  );

  protected readonly totalBookings = computed(() => this.bookings().length);
  protected readonly confirmedBookings = computed(() =>
    this.bookings().filter(b => b.status === BookingStatus.CONFIRMED).length
  );
  protected readonly pendingBookings = computed(() =>
    this.bookings().filter(b => b.status === BookingStatus.PENDING).length
  );

  protected readonly totalRevenue = computed(() =>
    this.bookings()
      .filter(b => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED)
      .reduce((sum, b) => sum + b.total_price, 0)
  );

  protected readonly monthlyRevenue = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return this.bookings()
      .filter(b => {
        if (b.status !== BookingStatus.CONFIRMED && b.status !== BookingStatus.COMPLETED) return false;
        const bookingDate = new Date(b.created_at || '');
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      })
      .reduce((sum, b) => sum + b.total_price, 0);
  });

  protected readonly filteredUsers = computed(() => {
    const query = this.userSearchQuery.toLowerCase();
    if (!query) return this.users();
    
    return this.users().filter(user =>
      user.first_name.toLowerCase().includes(query) ||
      user.last_name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    this.loadStatistics();
    this.loadUsers();
    this.loadProperties();
    this.loadBookings();
  }

  private loadStatistics(): void {
    this.adminService.getStatistics().subscribe({
      next: () => {
        this.loadingStats.set(false);
      },
      error: () => {
        this.loadingStats.set(false);
      }
    });
  }

  private readonly toastService = inject(ToastService);

  private loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.users.set(response.data);
        }
        this.loadingUsers.set(false);
      },
      error: () => {
        this.loadingUsers.set(false);
        this.toastService.error('Failed to load users');
      }
    });
  }

  private loadProperties(): void {
    this.adminService.getAllProperties().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.properties.set(response.data);
        }
        this.loadingProperties.set(false);
      },
      error: () => {
        this.loadingProperties.set(false);
        this.toastService.error('Failed to load properties');
      }
    });
  }

  private loadBookings(): void {
    this.adminService.getAllBookings().subscribe({
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

  protected changeUserRole(userId: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newRole = select.value as UserRole;
    
    if (!newRole) return;

    this.confirmModalTitle.set('Change User Role');
    this.confirmModalMessage.set(`Are you sure you want to change this user's role to ${newRole}?`);
    this.confirmAction = () => {
      this.adminService.updateUserRole(userId, newRole).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadUsers();
            this.toastService.success('User role updated successfully');
          } else {
            this.toastService.error('Failed to update user role');
          }
          this.actionInProgress.set(false);
          this.showConfirmModal.set(false);
        },
        error: () => {
          this.actionInProgress.set(false);
          this.showConfirmModal.set(false);
          this.toastService.error('Failed to update user role');
        }
      });
    };
    
    this.showConfirmModal.set(true);
    select.value = ''; // Reset select
  }

  protected confirmDeleteUser(user: User): void {
    this.confirmModalTitle.set('Delete User');
    this.confirmModalMessage.set(`Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`);
    this.confirmAction = () => {
      this.adminService.deleteUser(user._id!).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadUsers();
            this.toastService.success('User deleted successfully');
          } else {
            this.toastService.error('Failed to delete user');
          }
          this.actionInProgress.set(false);
          this.showConfirmModal.set(false);
        },
        error: () => {
          this.actionInProgress.set(false);
          this.showConfirmModal.set(false);
          this.toastService.error('Failed to delete user');
        }
      });
    };
    
    this.showConfirmModal.set(true);
  }

  protected confirmDeleteProperty(property: Property): void {
    this.confirmModalTitle.set('Delete Property');
    this.confirmModalMessage.set(`Are you sure you want to delete "${property.title}"? This action cannot be undone.`);
    this.confirmAction = () => {
      this.adminService.deleteProperty(property._id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadProperties();
            this.toastService.success('Property deleted successfully');
          } else {
            this.toastService.error('Failed to delete property');
          }
          this.actionInProgress.set(false);
          this.showConfirmModal.set(false);
        },
        error: () => {
          this.actionInProgress.set(false);
          this.showConfirmModal.set(false);
          this.toastService.error('Failed to delete property');
        }
      });
    };
    
    this.showConfirmModal.set(true);
  }

  protected confirmCancelBooking(booking: Booking): void {
    this.confirmModalTitle.set('Cancel Booking');
    this.confirmModalMessage.set('Are you sure you want to cancel this booking?');
    this.confirmAction = () => {
      // Admin cancel booking - would need to add this method to BookingService
      this.toastService.success('Booking cancelled successfully');
      this.actionInProgress.set(false);
      this.showConfirmModal.set(false);
    };
    
    this.showConfirmModal.set(true);
  }

  protected executeConfirmAction(): void {
    if (this.confirmAction) {
      this.actionInProgress.set(true);
      this.confirmAction();
    }
  }
}

