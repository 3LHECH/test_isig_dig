import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from './pages/home/home/home';
import { Navbar } from './shared/navbar/navbar';
import { AuthService } from './core/services/auth.service'; // Adjust path if needed

@Component({
  imports: [RouterOutlet, Home, Navbar],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('test_angular');
  protected readonly authService = inject(AuthService);
}