import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  menuOpen = false;
  
  constructor(private router: Router) {}
  
  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  }
  
  getRole(): string {
    if (typeof window === 'undefined') return '';
    const role = localStorage.getItem('role') || '';
    console.log('Navbar - Current role:', role);
    return role;
  }
  
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
    }
    this.router.navigate(['/']);
  }
}
