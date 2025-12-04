import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-add-property',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-property.html',
  styleUrl: './add-property.css'
})
export class AddProperty implements OnInit {
  property = {
    title: '',
    price: '',
    location: '',
    type: 'apartment',
    available: true
  };
  
  loading = false;
  error = '';
  success = false;
  
  propertyTypes = ['apartment', 'house', 'flat', 'studio', 'penthouse', 'bungalow', 'cottage'];
  cities = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol', 'Edinburgh', 'Glasgow', 'Cardiff', 'Newcastle', 'Sheffield', 'Nottingham', 'Southampton', 'Leicester', 'Cambridge', 'Oxford'];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (typeof window === 'undefined') return;
    
    // Check if user is agent or admin
    if (!this.authService.isAgent()) {
      console.warn('User is not an agent or admin, redirecting...');
      this.router.navigate(['/properties']);
      return;
    }
  }

  onSubmit() {
    this.error = '';
    
    if (!this.property.title || !this.property.price || !this.property.location) {
      this.error = 'Please fill in all required fields';
      return;
    }
    
    if (parseFloat(this.property.price) <= 0) {
      this.error = 'Price must be greater than 0';
      return;
    }
    
    this.loading = true;
    
    // Convert price to number
    const propertyData = {
      ...this.property,
      price: parseInt(this.property.price)
    };
    
    this.apiService.createAgentProperty(propertyData).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || err.error?.Error || 'Failed to add property';
        console.error('Error adding property:', err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
