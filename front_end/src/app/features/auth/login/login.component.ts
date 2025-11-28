import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-6 offset-md-3">
          <div class="card">
            <div class="card-header">
              <h3>Login</h3>
            </div>
            <div class="card-body">
              <form (ngSubmit)="login()">
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
                <button type="submit" class="btn btn-primary w-100">Login</button>
                <p class="mt-3 text-center">
                  Don't have an account? <a routerLink="/register">Register here</a>
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
      background-color: #007bff;
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
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    a {
      color: #007bff;
      text-decoration: none;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  login() {
    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.auth.login({ email: this.email, password: this.password })
      .subscribe({
        next: () => {
          this.router.navigate(['/properties']);
        },
        error: (err) => {
          this.error = err.message || 'Login failed';
        }
      });
  }
}
