import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  loading = false;
  error = '';
  showPassword = false;

  constructor(private apiService: ApiService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = '';

    this.apiService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        if (typeof window !== 'undefined') {
          // Store token
          localStorage.setItem('token', response.access_token);
          // Store role for backward compatibility
          localStorage.setItem('role', response.role);
          
          // Also store user object for AuthService
          const user = {
            _id: response.user_id || '',
            email: this.email,
            role: response.role
          };
          localStorage.setItem('user', JSON.stringify(user));
        }
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.Error || 'Login failed. Please check your credentials.';
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
