import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent } from '../../../shared/components/card.component';

// Login page component
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ButtonComponent, CardComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.toastService.success('Login successful! Welcome back.');
          
          // Role-based redirection
          const returnUrl = this.route.snapshot.queryParams['returnUrl'];
          if (returnUrl) {
            // If there's a return URL, use it
            this.router.navigateByUrl(returnUrl);
          } else {
            // Otherwise, redirect based on user role
            if (this.authService.isAdmin()) {
              this.router.navigate(['/admin/dashboard']);
            } else if (this.authService.isAgent()) {
              this.router.navigate(['/properties']);
            } else {
              // Customer or default
              this.router.navigate(['/properties']);
            }
          }
        }
      },
      error: (error) => {
        this.loading.set(false);
        const errorMsg = error.error?.message || 'Login failed. Please check your credentials.';
        this.errorMessage.set(errorMsg);
        this.toastService.error('Login failed: Invalid email or password');
        // Clear password on error for security
        this.loginForm.patchValue({ password: '' });
      }
    });
  }
}

