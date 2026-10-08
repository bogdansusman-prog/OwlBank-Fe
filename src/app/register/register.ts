import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth';
import { getErrorMessage } from '../utils/error-message';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  firstName = '';
  lastName = '';
  email = '';
  phoneNumber = '';
  dateOfBirth = '';
  password = '';
  confirmPassword = '';

  errorMessage = '';
  isLoading = false;

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit(): void {
    this.errorMessage = '';

    if (
      !this.firstName.trim() ||
      !this.lastName.trim() ||
      !this.email.trim() ||
      !this.phoneNumber.trim() ||
      !this.dateOfBirth ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.errorMessage = 'Please complete all fields.';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage =
        'Password must contain at least 8 characters.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;

    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      dateOfBirth: this.dateOfBirth,
      password: this.password,
      confirmPassword: this.confirmPassword
    }).subscribe({

      next: () => {
        this.isLoading = false;

        this.router.navigate(['/login']);
      },

      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = getErrorMessage(error, 'Account creation failed.');
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
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