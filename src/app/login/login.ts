import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TokenService } from '../services/token';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = '';
  password = '';

  errorMessage = '';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Please complete all fields.';
      return;
    }

    this.isLoading = true;

    this.authService.login(
      this.email,
      this.password
    ).subscribe({

      next: (token: string) => {
  this.isLoading = false;

  this.tokenService.setToken(token);

  this.router.navigate(['/home']);
},

      error: (error: HttpErrorResponse) => {
        this.isLoading = false;

        if (error.status === 0) {
          this.errorMessage = 'Cannot connect to the server.';
          return;
        }

        if (
          typeof error.error === 'string' &&
          error.error.trim()
        ) {
          this.errorMessage = error.error;
          return;
        }

        this.errorMessage = 'Invalid email or password.';
      }
    });
  }

  onButtonMouseMove(event: MouseEvent): void {
    const button = event.currentTarget as HTMLButtonElement;
    const rect = button.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    button.style.setProperty('--mouse-x', `${mouseX}px`);
    button.style.setProperty('--mouse-y', `${mouseY}px`);
  }
}