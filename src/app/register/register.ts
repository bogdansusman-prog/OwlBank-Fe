import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  username = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';

  errorMessage = '';

  constructor(private router: Router) {}

  onSubmit(): void {
    this.errorMessage = '';

    if (
      !this.username.trim() ||
      !this.email.trim() ||
      !this.phone.trim() ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.errorMessage = 'Please complete all fields.';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must contain at least 8 characters.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.router.navigate(['/login']);
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