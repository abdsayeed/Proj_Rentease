import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { ButtonComponent } from '../shared/components/button.component';

// Navbar component
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <nav class="navbar">
      <div class="container">
        <!-- Logo -->
        <a routerLink="/" class="logo">
          <span class="logo-icon">🏠</span>
          <span class="logo-text">RentEase</span>
        </a>

        <!-- Desktop Navigation -->
        <div class="nav-links">
          <a routerLink="/properties" routerLinkActive="active">Properties</a>
          
          @if (authService.isAgent()) {
            <a routerLink="/agent/properties" routerLinkActive="active">My Properties</a>
            <a routerLink="/agent/bookings" routerLinkActive="active">Bookings</a>
          }
          
          @if (authService.isAdmin()) {
            <a routerLink="/admin/dashboard" routerLinkActive="active">Admin Panel</a>
          }
          
          @if (authService.isCustomer()) {
            <a routerLink="/user/bookings" routerLinkActive="active">My Bookings</a>
            <a routerLink="/user/favorites" routerLinkActive="active">Favorites</a>
          }
        </div>

        <!-- Actions -->
        <div class="nav-actions">
          <!-- Theme Toggle -->
          <button class="icon-btn" (click)="toggleTheme()" title="Toggle theme">
            @if (themeService.isDarkMode()) {
              <span>☀️</span>
            } @else {
              <span>🌙</span>
            }
          </button>

          <!-- User Menu or Auth Buttons -->
          @if (authService.isAuthenticated()) {
            <div class="user-menu">
              <button class="user-btn" (click)="toggleUserMenu()">
                <span class="user-avatar">
                  {{ authService.currentUser()?.first_name?.charAt(0) }}
                </span>
                <span class="user-name">
                  {{ authService.currentUser()?.first_name }}
                </span>
              </button>

              @if (showUserMenu()) {
                <div class="dropdown-menu">
                  <a routerLink="/user/profile" class="dropdown-item">
                    <span>👤</span> Profile
                  </a>
                  <a routerLink="/user/settings" class="dropdown-item">
                    <span>⚙️</span> Settings
                  </a>
                  <hr>
                  <button class="dropdown-item" (click)="logout()">
                    <span>🚪</span> Logout
                  </button>
                </div>
              }
            </div>
          } @else {
            <app-button
              variant="outline"
              size="sm"
              routerLink="/auth/login">
              Login
            </app-button>
            <app-button
              variant="primary"
              size="sm"
              routerLink="/auth/register">
              Sign Up
            </app-button>
          }

          <!-- Mobile Menu Toggle -->
          <button class="mobile-menu-btn" (click)="toggleMobileMenu()">
            <span>☰</span>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (showMobileMenu()) {
        <div class="mobile-menu">
          <a routerLink="/properties" (click)="toggleMobileMenu()">Properties</a>
          
          @if (authService.isAgent()) {
            <a routerLink="/agent/properties" (click)="toggleMobileMenu()">My Properties</a>
            <a routerLink="/agent/bookings" (click)="toggleMobileMenu()">Bookings</a>
          }
          
          @if (authService.isAdmin()) {
            <a routerLink="/admin/dashboard" (click)="toggleMobileMenu()">Admin Panel</a>
          }
          
          @if (authService.isCustomer()) {
            <a routerLink="/user/bookings" (click)="toggleMobileMenu()">My Bookings</a>
            <a routerLink="/user/favorites" (click)="toggleMobileMenu()">Favorites</a>
          }

          @if (!authService.isAuthenticated()) {
            <a routerLink="/auth/login" (click)="toggleMobileMenu()">Login</a>
            <a routerLink="/auth/register" (click)="toggleMobileMenu()">Sign Up</a>
          }
        </div>
      }
    </nav>
  `,
  styles: [`
    .navbar {
      background: var(--bg-surface, #ffffff);
      border-bottom: 1px solid var(--border-color, #e5e7eb);
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      font-weight: 700;
      color: #3b82f6;
      text-decoration: none;
    }

    .logo-icon {
      font-size: 2rem;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 2rem;
      flex: 1;
    }

    .nav-links a {
      color: var(--text-secondary, #6b7280);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }

    .nav-links a:hover,
    .nav-links a.active {
      color: #3b82f6;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.25rem;
      padding: 0.5rem;
      border-radius: 0.375rem;
      transition: background 0.2s;
    }

    .icon-btn:hover {
      background: var(--bg-muted, #f9fafb);
    }

    .user-menu {
      position: relative;
    }

    .user-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.375rem;
      transition: background 0.2s;
    }

    .user-btn:hover {
      background: var(--bg-muted, #f9fafb);
    }

    .user-avatar {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .user-name {
      font-weight: 500;
      color: var(--text-primary, #1f2937);
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: var(--bg-surface, #ffffff);
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      min-width: 200px;
      padding: 0.5rem 0;
      z-index: 50;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: var(--text-primary, #1f2937);
      text-decoration: none;
      width: 100%;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 0.95rem;
      transition: background 0.2s;
    }

    .dropdown-item:hover {
      background: var(--bg-muted, #f9fafb);
    }

    .dropdown-menu hr {
      border: none;
      border-top: 1px solid var(--border-color, #e5e7eb);
      margin: 0.5rem 0;
    }

    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
    }

    .mobile-menu {
      display: none;
      flex-direction: column;
      padding: 1rem;
      border-top: 1px solid var(--border-color, #e5e7eb);
    }

    .mobile-menu a {
      padding: 0.75rem 1rem;
      color: var(--text-primary, #1f2937);
      text-decoration: none;
      border-radius: 0.375rem;
      transition: background 0.2s;
    }

    .mobile-menu a:hover {
      background: var(--bg-muted, #f9fafb);
    }

    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }

      .mobile-menu-btn {
        display: block;
      }

      .mobile-menu {
        display: flex;
      }

      .user-name {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);

  protected readonly showUserMenu = signal(false);
  protected readonly showMobileMenu = signal(false);

  toggleUserMenu(): void {
    this.showUserMenu.update(show => !show);
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.update(show => !show);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu.set(false);
  }
}
