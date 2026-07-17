import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        // Save token using the auth service
        this.authService.setToken(response.token);
        // Redirect to admin dashboard
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.errorMessage = 'Login failed. Please check your credentials.';
        console.error('Login error', err);
      }
    });
  }
}
