import { Component, OnInit, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { BookingService } from '../../../core/services/booking.service';
import { ToastService } from '../../../core/services/toast.service';
import { Property } from '../../../core/models/property.model';
import { BookingPayload, GuestInfo } from '../../../core/models/booking.model';
import { CardComponent } from '../../../shared/components/card.component';
import { ButtonComponent } from '../../../shared/components/button.component';

// Booking wizard - multi step rental application form
@Component({
  selector: 'app-booking-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardComponent,
    ButtonComponent
  ],
  templateUrl: './booking-wizard.component.html',
  styleUrl: './booking-wizard.component.css'
})
export class BookingWizardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly propertyService = inject(PropertyService);
  private readonly bookingService = inject(BookingService);
  private readonly toastService = inject(ToastService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly property = signal<Property | null>(null);
  protected readonly currentStep = signal(1);
  protected readonly submitting = signal(false);
  protected readonly bookingSuccess = signal(false);
  protected readonly bookingReference = signal('');

  // Rental application wizard steps
  protected readonly steps = [
    { number: 1, label: 'Lease Details' },
    { number: 2, label: 'Tenant Info' },
    { number: 3, label: 'Deposit' },
    { number: 4, label: 'Complete' }
  ];

  protected bookingForm!: FormGroup;

  protected readonly numberOfNights = computed(() => {
    const checkIn = this.bookingForm?.get('check_in_date')?.value;
    const checkOut = this.bookingForm?.get('check_out_date')?.value;
    if (!checkIn || !checkOut) return 0;
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  });

  protected readonly totalPrice = computed(() => {
    const prop = this.property();
    if (!prop) return 0;
    return this.numberOfNights() * prop.price_per_night;
  });

  protected readonly serviceFee = computed(() => {
    return Math.round(this.totalPrice() * 0.1); // 10% service fee
  });

  protected readonly finalTotal = computed(() => {
    return this.totalPrice() + this.serviceFee();
  });

  get guestsArray(): FormArray {
    return this.bookingForm.get('guests') as FormArray;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadBookingData();
  }

  private initializeForm(): void {
    const queryParams = this.route.snapshot.queryParams;
    
    this.bookingForm = this.fb.group({
      property_id: [queryParams['propertyId'] || '', Validators.required],
      check_in_date: [queryParams['checkIn'] || '', Validators.required],
      check_out_date: [queryParams['checkOut'] || '', Validators.required],
      number_of_guests: [parseInt(queryParams['guests']) || 1, [Validators.required, Validators.min(1)]],
      guests: this.fb.array([])
    });

    // Initialize guest forms based on number of guests
    const numberOfGuests = this.bookingForm.get('number_of_guests')?.value || 1;
    for (let i = 0; i < numberOfGuests; i++) {
      this.addGuest();
    }
  }

  private loadBookingData(): void {
    const propertyId = this.bookingForm.get('property_id')?.value;
    
    if (!propertyId) {
      this.errorMessage.set('Missing booking information. Please start from property details page.');
      this.loading.set(false);
      return;
    }

    this.propertyService.getPropertyById(propertyId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.property.set(response.data);
        } else {
          this.errorMessage.set('Failed to load property details');
          this.toastService.error('Failed to load property details');
        }
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load property details');
        this.loading.set(false);
        this.toastService.error('Failed to load property details');
      }
    });
  }

  private createGuestForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]]
    });
  }

  protected addGuest(): void {
    this.guestsArray.push(this.createGuestForm());
  }

  protected removeGuest(index: number): void {
    if (this.guestsArray.length > 1) {
      this.guestsArray.removeAt(index);
    }
  }

  protected canAddMoreGuests(): boolean {
    const maxGuests = this.bookingForm.get('number_of_guests')?.value || 1;
    return this.guestsArray.length < maxGuests;
  }

  protected isCurrentStepValid(): boolean {
    if (this.currentStep() === 1) {
      return !!(this.bookingForm.get('property_id')?.valid &&
             this.bookingForm.get('check_in_date')?.valid &&
             this.bookingForm.get('check_out_date')?.valid);
    }
    if (this.currentStep() === 2) {
      return this.guestsArray.valid;
    }
    return true;
  }

  protected nextStep(): void {
    if (this.isCurrentStepValid() && this.currentStep() < 4) {
      this.currentStep.set(this.currentStep() + 1);
      if (this.isBrowser) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  protected previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
      if (this.isBrowser) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  protected handleSubmit(): void {
    if (!this.bookingForm.valid) return;

    this.submitting.set(true);
    this.currentStep.set(4);

    const bookingData: BookingPayload = {
      property_id: this.bookingForm.get('property_id')?.value,
      check_in_date: this.bookingForm.get('check_in_date')?.value,
      check_out_date: this.bookingForm.get('check_out_date')?.value,
      number_of_guests: this.bookingForm.get('number_of_guests')?.value,
      guests: this.guestsArray.value
    };

    this.bookingService.createBooking(bookingData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.bookingSuccess.set(true);
          this.bookingReference.set(response.data._id || 'PENDING');
          this.toastService.success('Booking created successfully!');
        } else {
          this.errorMessage.set(response.message || 'Booking failed');
          this.toastService.error('Failed to create booking. Please try again.');
        }
        this.submitting.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Booking failed. Please try again.');
        this.submitting.set(false);
        this.currentStep.set(3); // Go back to payment step
        this.toastService.error('Failed to create booking. Please try again.');
      }
    });
  }
}

