import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-details.html',
  styleUrl: './property-details.css'
})
export class PropertyDetails implements OnInit {
  property: any = null;
  loading = true;
  error = '';
  inquiryMessage = '';
  showInquiryForm = false;
  inquirySuccess = false;
  isFavorite = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
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
      this.error = 'No property ID provided';
    }
  }

  loadProperty(id: string) {
    console.log('Loading property:', id);
    this.loading = true;
    this.error = '';
    
    // Set a timeout in case the request hangs
    const timeoutId = setTimeout(() => {
      if (this.loading) {
        console.error('Request timeout');
        this.error = 'Request timeout - please try again';
        this.loading = false;
      }
    }, 10000); // 10 second timeout
    
    this.apiService.getProperty(id).subscribe({
      next: (data) => {
        clearTimeout(timeoutId);
        console.log('Property loaded:', data);
        this.property = data;
        this.loading = false;
      },
      error: (err) => {
        clearTimeout(timeoutId);
        console.error('Error loading property:', err);
        this.error = err.status === 404 ? 'Property not found' : 'Failed to load property. Please check your connection.';
        this.loading = false;
      }
    });
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

    this.apiService.sendInquiry({
      property_id: this.property._id,
      message: this.inquiryMessage
    }).subscribe({
      next: () => {
        this.inquirySuccess = true;
        this.inquiryMessage = '';
        setTimeout(() => {
          this.inquirySuccess = false;
          this.showInquiryForm = false;
        }, 3000);
      },
      error: (err) => console.error(err)
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
