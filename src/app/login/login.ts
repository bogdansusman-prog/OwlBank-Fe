import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth';
import { getErrorMessage } from '../utils/error-message';

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

  showPassword = false;

  constructor(
    private router: Router,
    private authService: AuthService,
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

  localStorage.setItem("token" , token);

  this.router.navigate(['/home']);
},

      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = getErrorMessage(error, 'Invalid email or password.');
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
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