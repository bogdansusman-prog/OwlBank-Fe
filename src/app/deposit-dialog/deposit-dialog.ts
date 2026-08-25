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
  selector: 'app-deposit-dialog',
  imports: [
    FormsModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './deposit-dialog.html',
  styleUrl: './deposit-dialog.css'
})
export class DepositDialog {

  amount: number | null = null;

  isLoading = false;
  errorMessage = '';
  description = '';
  constructor(
    private dialogRef: MatDialogRef<DepositDialog>,
    private userService: UserService
  ) {}

  deposit(): void {
    this.errorMessage = '';

    if (
      this.amount === null ||
      this.amount <= 0
    ) {
      this.errorMessage =
        'Please enter a valid amount.';
      return;
    }

    if(!this.description.trim()){
      this.errorMessage =
        'Please enter a description.';
        return;
    }

    this.isLoading = true;

    this.userService.deposit(
      this.amount,
      this.description
    ).subscribe({

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

        this.errorMessage =
          'Deposit failed. Please try again.';
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}








