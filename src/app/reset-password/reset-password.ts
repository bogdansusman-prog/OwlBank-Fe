import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../services/auth';
import { getErrorMessage } from '../utils/error-message';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword {

  email = '';
  password = '';
  newPassword = '';
  confirmPassword = '';

  errorMessage = '';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit(): void {
    this.errorMessage = '';

    if (
      !this.email.trim() ||
      !this.password ||
      !this.newPassword ||
      !this.confirmPassword
    ) {
      this.errorMessage = 'Please complete all fields.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage =
        'New password must contain at least 8 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;

    this.authService.resetPassword({
      email: this.email,
      password: this.password,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    }).subscribe({

      next: () => {
        this.isLoading = false;

        this.router.navigate(['/login']);
      },

      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = getErrorMessage(error, 'Password reset failed.');
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