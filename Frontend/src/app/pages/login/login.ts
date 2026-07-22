import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        if (res.token) {
          this.authService.setToken(res.token);
        }
        // Redirect to admin dashboard on successful login
        this.router.navigate(['/admin'], { replaceUrl: true }); 
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Invalid email or password.';
        console.error('Login error', err);
        this.isLoading = false;
      }
    });
  }
}
