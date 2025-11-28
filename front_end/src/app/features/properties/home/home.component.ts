import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <h1>Welcome to Rentease</h1>
          <p class="lead">Property Rental Management System</p>
          
          <div class="alert alert-info">
            <h4>Frontend is running! ✅</h4>
            <p>Backend: http://127.0.0.1:5000</p>
            <p>Frontend: http://localhost:4300</p>
          </div>

          <div class="btn-group">
            <button routerLink="/login" class="btn btn-primary">Login</button>
            <button routerLink="/register" class="btn btn-success">Register</button>
          </div>

          <hr>
          <h3>System Status</h3>
          <ul>
            <li>✅ Backend (Flask) - Running on port 5000</li>
            <li>✅ Frontend (Angular) - Running on port 4300</li>
            <li>✅ Database (MongoDB) - Connected</li>
            <li>⏳ Components - Being built</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
    }
    .lead {
      color: #666;
      font-size: 18px;
    }
    .btn-group {
      gap: 10px;
    }
    button {
      padding: 10px 20px;
      font-size: 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    .btn-success {
      background-color: #28a745;
      color: white;
    }
    ul {
      list-style-type: none;
      padding: 0;
    }
    li {
      padding: 8px 0;
      font-size: 16px;
    }
  `]
})
export class HomeComponent {}
