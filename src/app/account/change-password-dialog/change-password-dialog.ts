import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule
  ],
  templateUrl: './change-password-dialog.html',
  styleUrl: './change-password-dialog.css'
})
export class ChangePasswordDialog {

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

errorMessage = '';
successMessage = '';
isLoading = false;

  constructor(
    private dialogRef:
      MatDialogRef<ChangePasswordDialog>
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  changePassword(): void {

    this.errorMessage = '';

    if (
      !this.currentPassword ||
      !this.newPassword ||
      !this.confirmPassword
    ) {
      this.errorMessage =
        'Please complete all fields.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage =
        'New password must contain at least 8 characters.';
      return;
    }

    if (
      this.newPassword !==
      this.confirmPassword
    ) {
      this.errorMessage =
        'New passwords do not match.';
      return;
    }


    console.log({
      currentPassword:
        this.currentPassword,
      newPassword:
        this.newPassword
    });
  }
}
