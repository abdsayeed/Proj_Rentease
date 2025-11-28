import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-6 offset-md-3">
          <div class="card">
            <div class="card-header">
              <h3>Register</h3>
            </div>
            <div class="card-body">
              <form (ngSubmit)="register()">
                <div class="mb-3">
                  <label>Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    [(ngModel)]="email" 
                    name="email"
                    required
                  >
                </div>
                <div class="mb-3">
                  <label>Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    [(ngModel)]="password" 
                    name="password"
                    required
                  >
                </div>
                <div class="mb-3">
                  <label>Confirm Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    [(ngModel)]="confirmPassword" 
                    name="confirmPassword"
                    required
                  >
                </div>
                <div class="mb-3">
                  <label>Register as:</label>
                  <select class="form-control" [(ngModel)]="role" name="role">
                    <option value="user">User (Renter)</option>
                    <option value="agent">Agent (Property Owner)</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-success w-100">Register</button>
                <p class="mt-3 text-center">
                  Already have an account? <a routerLink="/login">Login here</a>
                </p>
              </form>
              <div *ngIf="error" class="alert alert-danger mt-3">{{ error }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .card-header {
      background-color: #28a745;
      color: white;
      padding: 15px;
    }
    .card-header h3 {
      margin: 0;
    }
    .form-control {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .btn {
      padding: 10px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-success {
      background-color: #28a745;
      color: white;
    }
    a {
      color: #007bff;
      text-decoration: none;
    }
  `]
})
export class RegisterComponent {
  email = '';
  password = '';
  confirmPassword = '';
  role: 'user' | 'agent' = 'user';
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  register() {
    if (!this.email || !this.password || !this.confirmPassword) {
      this.error = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.auth.register({ 
      email: this.email, 
      password: this.password,
      confirmPassword: this.confirmPassword,
      role: this.role 
    }).subscribe({
      next: () => {
        this.router.navigate(['/properties']);
      },
      error: (err) => {
        this.error = err.message || 'Registration failed';
      }
    });
  }
}
