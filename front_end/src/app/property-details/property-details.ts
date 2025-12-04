import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Property } from '../core/models';
import { BrokenImageDirective } from '../shared/directives/broken-image.directive';
import { DateAgoPipe } from '../shared/pipes/date-ago.pipe';
import { ToastService } from '../shared/services/toast.service';

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, BrokenImageDirective, DateAgoPipe],
  templateUrl: './property-details.html',
  styleUrl: './property-details.css'
})
export class PropertyDetails implements OnInit {
  property: Property | null = null;
  loading = true;
  inquiryMessage = '';
  showInquiryForm = false;
  isFavorite = false;
  sendingInquiry = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toastService: ToastService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false;
      this.property = null;
      return;
    }
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProperty(id);
    } else {
      this.loading = false;
      this.router.navigate(['/properties']);
    }
  }

  loadProperty(id: string) {
    this.loading = true;
    
    this.apiService.getProperty(id).subscribe({
      next: (data) => {
        this.property = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading property:', err);
      }
    });
  }

  get statusClass(): string {
    if (!this.property) return '';
    return this.property.available ? 'status-available' : 'status-unavailable';
  }

  get statusText(): string {
    if (!this.property) return '';
    return this.property.available ? 'Available' : 'Not Available';
  }

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  }

  toggleFavorite() {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.property) return;

    if (this.isFavorite) {
      this.apiService.removeFavorite(this.property._id).subscribe({
        next: () => {
          this.isFavorite = false;
        },
        error: (err) => console.error(err)
      });
    } else {
      this.apiService.addFavorite(this.property._id).subscribe({
        next: () => {
          this.isFavorite = true;
        },
        error: (err) => console.error(err)
      });
    }
  }

  toggleInquiryForm() {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.showInquiryForm = !this.showInquiryForm;
  }

  sendInquiry() {
    if (!this.inquiryMessage.trim()) {
      return;
    }

    if (!this.property) return;

    this.sendingInquiry = true;

    this.apiService.sendInquiry({
      property_id: this.property._id,
      message: this.inquiryMessage
    }).subscribe({
      next: () => {
        this.sendingInquiry = false;
        this.inquiryMessage = '';
        this.showInquiryForm = false;
        this.toastService.success('Inquiry sent successfully!');
      },
      error: (err) => {
        this.sendingInquiry = false;
        console.error(err);
        this.toastService.error('Failed to send inquiry');
      }
    });
  }

  goBack() {
    this.router.navigate(['/properties']);
  }
}
