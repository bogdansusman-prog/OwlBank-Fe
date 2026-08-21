import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import {
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import { MatIconModule } from '@angular/material/icon';

import { UserService } from '../services/user';

@Component({
  selector: 'app-send-money-dialog',
  imports: [
    FormsModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './send-money-dialog.html',
  styleUrl: './send-money-dialog.css'
})
export class SendMoneyDialog {

  phoneNumber = '';
  amount: number | null = null;

  isLoading = false;
  errorMessage = '';

  constructor(
    private dialogRef: MatDialogRef<SendMoneyDialog>,
    private userService: UserService
  ) {}

  sendMoney(): void {
    this.errorMessage = '';

    const phone = this.phoneNumber.trim();

    if (!phone) {
      this.errorMessage =
        'Please enter a phone number.';
      return;
    }

    if (
      this.amount === null ||
      this.amount <= 0
    ) {
      this.errorMessage =
        'Please enter a valid amount.';
      return;
    }

    this.isLoading = true;

    this.userService
      .transferMoney(
        phone,
        this.amount
      )
      .subscribe({

        next: () => {
          this.isLoading = false;

          this.dialogRef.close(true);
        },

        error: (error: HttpErrorResponse) => {
          this.isLoading = false;

          if (error.status === 401) {
            this.errorMessage =
              'Your session has expired. Please log in again.';
            return;
          }

          if (error.status === 404) {
            this.errorMessage =
              'No OwlBank user was found with this phone number.';
            return;
          }

          if (error.status === 400) {
            this.errorMessage =
              'Transfer failed. Check your balance and the transfer amount.';
            return;
          }

          this.errorMessage =
            'Transfer failed. Please try again.';
        }
      });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}