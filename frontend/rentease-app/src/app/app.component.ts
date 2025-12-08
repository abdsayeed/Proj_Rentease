import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar.component';
import { FooterComponent } from './layout/footer.component';
import { ToastComponent } from './shared/components/toast.component';

// Root component
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent],
  template: `
    <div class="app-container">
      <app-navbar />
      <main class="main-content">
        <router-outlet />
      </main>
      <app-footer />
      <app-toast />
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
    }
  `]
})
export class AppComponent {
  title = 'RentEase';
}
