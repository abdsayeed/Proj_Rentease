import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { CardComponent } from '../../../shared/components/card.component';
import { ButtonComponent } from '../../../shared/components/button.component';

// property interface for agent
interface AgentProperty {
  _id: string;
  title: string;
  price: number;
  location: any;
  property_type?: string;
  type?: string;
  available: boolean;
  agent_id: string;
}

// Agent dashboard - manage properties
@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent
  ],
  templateUrl: './agent-dashboard.component.html',
  styleUrl: './agent-dashboard.component.css'
})
export class AgentDashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  private readonly API_URL = 'http://127.0.0.1:5000/api/v1';

  // Signals
  protected readonly properties = signal<AgentProperty[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly showAddForm = signal(false);
  protected readonly editingProperty = signal<AgentProperty | null>(null);
  protected readonly activeTab = signal<'properties' | 'add'>('properties');

  // Form
  protected propertyForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadMyProperties();
  }

  private initForm(): void {
    this.propertyForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      price: ['', [Validators.required, Validators.min(100)]],
      property_type: ['apartment', Validators.required],
      available: [true],
      location: this.fb.group({
        address: ['', Validators.required],
        city: ['', Validators.required],
        state: [''],
        country: ['UK', Validators.required],
        zip_code: ['']
      })
    });
  }

  private loadMyProperties(): void {
    this.loading.set(true);
    
    this.http.get<any[]>(`${this.API_URL}/agent/properties`).subscribe({
      next: (data) => {
        // Handle both array response and object with data property
        const properties = Array.isArray(data) ? data : (data as any).data || [];
        this.properties.set(properties);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading properties:', err);
        this.toastService.error('Failed to load your properties');
        this.loading.set(false);
      }
    });
  }

  protected openAddForm(): void {
    this.editingProperty.set(null);
    this.propertyForm.reset({
      property_type: 'apartment',
      available: true,
      location: { country: 'UK' }
    });
    this.showAddForm.set(true);
    this.activeTab.set('add');
  }

  protected editProperty(property: AgentProperty): void {
    this.editingProperty.set(property);
    this.propertyForm.patchValue({
      title: property.title,
      price: property.price,
      property_type: property.property_type || property.type || 'apartment',
      available: property.available,
      location: property.location || {}
    });
    this.showAddForm.set(true);
    this.activeTab.set('add');
  }

  protected cancelForm(): void {
    this.showAddForm.set(false);
    this.editingProperty.set(null);
    this.activeTab.set('properties');
    this.propertyForm.reset();
  }

  protected saveProperty(): void {
    if (this.propertyForm.invalid) {
      this.toastService.error('Please fill all required fields');
      return;
    }

    this.saving.set(true);
    const formData = this.propertyForm.value;

    if (this.editingProperty()) {
      // Update existing property
      this.http.put<any>(`${this.API_URL}/agent/properties/${this.editingProperty()!._id}`, formData).subscribe({
        next: () => {
          this.toastService.success('Property updated successfully');
          this.loadMyProperties();
          this.cancelForm();
          this.saving.set(false);
        },
        error: (err) => {
          console.error('Error updating property:', err);
          this.toastService.error(err.error?.Error || 'Failed to update property');
          this.saving.set(false);
        }
      });
    } else {
      // Create new property
      this.http.post<any>(`${this.API_URL}/agent/properties`, formData).subscribe({
        next: () => {
          this.toastService.success('Property created successfully');
          this.loadMyProperties();
          this.cancelForm();
          this.saving.set(false);
        },
        error: (err) => {
          console.error('Error creating property:', err);
          this.toastService.error(err.error?.Error || 'Failed to create property');
          this.saving.set(false);
        }
      });
    }
  }

  protected deleteProperty(property: AgentProperty): void {
    if (!confirm(`Are you sure you want to delete "${property.title}"?`)) {
      return;
    }

    this.http.delete<any>(`${this.API_URL}/agent/properties/${property._id}`).subscribe({
      next: () => {
        this.toastService.success('Property deleted successfully');
        this.properties.update(props => props.filter(p => p._id !== property._id));
      },
      error: (err) => {
        console.error('Error deleting property:', err);
        this.toastService.error(err.error?.Error || 'Failed to delete property');
      }
    });
  }

  protected toggleAvailability(property: AgentProperty): void {
    const newStatus = !property.available;
    
    this.http.put<any>(`${this.API_URL}/agent/properties/${property._id}`, {
      available: newStatus
    }).subscribe({
      next: () => {
        this.toastService.success(`Property marked as ${newStatus ? 'available' : 'unavailable'}`);
        this.properties.update(props => 
          props.map(p => p._id === property._id ? { ...p, available: newStatus } : p)
        );
      },
      error: (err) => {
        console.error('Error updating availability:', err);
        this.toastService.error('Failed to update availability');
      }
    });
  }

  protected getPropertyTypeLabel(type: string): string {
    const types: Record<string, string> = {
      'apartment': 'Apartment',
      'house': 'House',
      'condo': 'Condo',
      'townhouse': 'Townhouse',
      'studio': 'Studio'
    };
    return types[type] || type;
  }
}
