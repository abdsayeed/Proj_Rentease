import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Footer component
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <!-- Company Info -->
          <div class="footer-section">
            <div class="footer-logo">
              <span class="logo-icon">🏠</span>
              <span class="logo-text">RentEase</span>
            </div>
            <p class="footer-description">
              Find your perfect rental property with ease. 
              Trusted by thousands of users worldwide.
            </p>
          </div>

          <!-- Quick Links -->
          <div class="footer-section">
            <h3 class="footer-title">Quick Links</h3>
            <ul class="footer-links">
              <li><a routerLink="/">Home</a></li>
              <li><a routerLink="/properties">Browse Properties</a></li>
              <li><a routerLink="/about">About Us</a></li>
              <li><a routerLink="/contact">Contact</a></li>
            </ul>
          </div>

          <!-- For Agents -->
          <div class="footer-section">
            <h3 class="footer-title">For Agents</h3>
            <ul class="footer-links">
              <li><a routerLink="/auth/register">Become an Agent</a></li>
              <li><a routerLink="/agent/properties">List Property</a></li>
              <li><a routerLink="/pricing">Pricing</a></li>
              <li><a routerLink="/faq">FAQ</a></li>
            </ul>
          </div>

          <!-- Legal -->
          <div class="footer-section">
            <h3 class="footer-title">Legal</h3>
            <ul class="footer-links">
              <li><a routerLink="/terms">Terms of Service</a></li>
              <li><a routerLink="/privacy">Privacy Policy</a></li>
              <li><a routerLink="/cookies">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <!-- Social Links -->
        <div class="footer-social">
          <a href="https://facebook.com" target="_blank" rel="noopener" title="Facebook">
            <span>📘</span>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener" title="Twitter">
            <span>🐦</span>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener" title="Instagram">
            <span>📷</span>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener" title="LinkedIn">
            <span>💼</span>
          </a>
        </div>

        <!-- Copyright -->
        <div class="footer-bottom">
          <p>&copy; 2025 RentEase. All rights reserved.</p>
          <p>Built with Angular 19 & ❤️</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--bg-surface, #1f2937);
      color: var(--text-primary-inverse, #f9fafb);
      padding: 3rem 0 1rem;
      margin-top: auto;
    }

    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .footer-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      font-weight: 700;
      color: #3b82f6;
    }

    .logo-icon {
      font-size: 2rem;
    }

    .footer-description {
      color: #9ca3af;
      line-height: 1.6;
    }

    .footer-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .footer-links a {
      color: #9ca3af;
      text-decoration: none;
      transition: color 0.2s;
    }

    .footer-links a:hover {
      color: #3b82f6;
    }

    .footer-social {
      display: flex;
      justify-content: center;
      gap: 1rem;
      padding: 2rem 0;
      border-top: 1px solid #374151;
      border-bottom: 1px solid #374151;
    }

    .footer-social a {
      font-size: 1.5rem;
      opacity: 0.8;
      transition: opacity 0.2s, transform 0.2s;
    }

    .footer-social a:hover {
      opacity: 1;
      transform: scale(1.1);
    }

    .footer-bottom {
      text-align: center;
      padding-top: 2rem;
      color: #9ca3af;
      font-size: 0.875rem;
    }

    .footer-bottom p {
      margin: 0.25rem 0;
    }

    @media (max-width: 768px) {
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }
  `]
})
export class FooterComponent {}
