import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserRole } from '../../../core/models/user.model';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent } from '../../../shared/components/card.component';

// Register page component
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ButtonComponent, CardComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  protected readonly UserRole = UserRole;
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm_password: ['', Validators.required],
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    phone: [''],
    role: [UserRole.CUSTOMER, Validators.required]
  }, {
    validators: this.passwordMatchValidator
  });

  get emailControl() {
    return this.registerForm.get('email');
  }

  get passwordControl() {
    return this.registerForm.get('password');
  }

  get confirmPasswordControl() {
    return this.registerForm.get('confirm_password');
  }

  get firstNameControl() {
    return this.registerForm.get('first_name');
  }

  get lastNameControl() {
    return this.registerForm.get('last_name');
  }

  /**
   * Custom validator to check if passwords match
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirm_password');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  selectRole(role: UserRole): void {
    this.registerForm.patchValue({ role });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          // Show success toast
          this.toastService.success('Registration successful! Please login with your credentials.');
          // Clear auth data so user needs to login manually
          this.authService.logout();
          // Navigate to login page
          this.router.navigate(['/auth/login']);
        }
      },
      error: (error) => {
        this.loading.set(false);
        const errorMsg = error.error?.message || 'Registration failed. Please try again.';
        this.errorMessage.set(errorMsg);
        this.toastService.error(errorMsg);
      }
    });
  }
}

