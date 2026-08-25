import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-identity-verification',
  imports: [FormsModule, RouterLink],
  templateUrl: './identity-verification.html',
  styleUrl: './identity-verification.css'
})
export class IdentityVerification {
  firstName = '';
  lastName = '';
  cnp = '';
  documentSeries = '';
  documentNumber = '';
  address = '';

  errorMessage = '';

  constructor(private router: Router) {}

  onCnpInput(): void {
    // Elimină literele și limitează CNP-ul la 13 cifre.
    this.cnp = this.cnp.replace(/\D/g, '').slice(0, 13);
  }

  onDocumentSeriesInput(): void {
    this.documentSeries = this.documentSeries
      .replace(/[^a-zA-Z]/g, '')
      .toUpperCase()
      .slice(0, 2);
  }

  onDocumentNumberInput(): void {
    this.documentNumber = this.documentNumber
      .replace(/\D/g, '')
      .slice(0, 6);
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (
      !this.firstName.trim() ||
      !this.lastName.trim() ||
      !this.cnp.trim() ||
      !this.documentSeries.trim() ||
      !this.documentNumber.trim() ||
      !this.address.trim()
    ) {
      this.errorMessage = 'Please complete all fields.';
      return;
    }

    if (!/^\d{13}$/.test(this.cnp)) {
      this.errorMessage = 'CNP must contain exactly 13 digits.';
      return;
    }

    if (!/^[A-Z]{2}$/.test(this.documentSeries)) {
      this.errorMessage = 'ID series must contain exactly 2 letters.';
      return;
    }

    if (!/^\d{6}$/.test(this.documentNumber)) {
      this.errorMessage = 'ID number must contain exactly 6 digits.';
      return;
    }

    // Momentan simulăm verificarea identității.
    this.router.navigate(['/login']);
  }
}