import {
  Component,
  Inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@angular/material/dialog';

import { MatIconModule } from '@angular/material/icon';

import { UserService } from '../../services/user';


@Component({
  selector: 'app-change-password-dialog',

  standalone: true,

  imports: [
    FormsModule,
    MatIconModule
  ],

  templateUrl:
    './change-password-dialog.html',

  styleUrl:
    './change-password-dialog.css'
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
      MatDialogRef<ChangePasswordDialog>,

    private userService:
      UserService,

    @Inject(MAT_DIALOG_DATA)
    public data: {
      email: string;
    }
  ) {}


  close(): void {

    if (this.isLoading) {
      return;
    }

    this.dialogRef.close();
  }


  changePassword(): void {

    this.errorMessage = '';
    this.successMessage = '';


    // Toate câmpurile obligatorii
    if (
      !this.currentPassword.trim() ||
      !this.newPassword.trim() ||
      !this.confirmPassword.trim()
    ) {
      this.errorMessage =
        'Please complete all fields.';

      return;
    }


    // Parola nouă minim 8 caractere
    if (
      this.newPassword.length < 8
    ) {
      this.errorMessage =
        'New password must contain at least 8 characters.';

      return;
    }


    // Confirmarea trebuie să fie identică
    if (
      this.newPassword !==
      this.confirmPassword
    ) {
      this.errorMessage =
        'New passwords do not match.';

      return;
    }


    // Nu permitem aceeași parolă
    if (
      this.currentPassword ===
      this.newPassword
    ) {
      this.errorMessage =
        'New password must be different from your current password.';

      return;
    }


    this.isLoading = true;


    this.userService
      .resetPassword(
        this.data.email,
        this.currentPassword,
        this.newPassword,
        this.confirmPassword
      )
      .subscribe({

        next: (response) => {

          console.log(
            'PASSWORD RESET RESPONSE:',
            response
          );

          this.isLoading = false;

          this.successMessage =
            response?.trim() ||
            'Password changed successfully.';


          // Închidem popup-ul după succes
          setTimeout(() => {

            this.dialogRef.close(true);

          }, 1000);
        },


        error: (error) => {

          console.error(
            'PASSWORD RESET ERROR:',
            error
          );

          this.isLoading = false;


          // Dacă backend-ul ne trimite un mesaj text,
          // îl afișăm direct.
          if (
            typeof error.error === 'string' &&
            error.error.trim()
          ) {
            this.errorMessage =
              error.error;

            return;
          }


          if (error.status === 400) {
            this.errorMessage =
              'Current password is incorrect or the new password is invalid.';

            return;
          }


          if (error.status === 401) {
            this.errorMessage =
              'You are not authorized. Please log in again.';

            return;
          }


          if (error.status === 404) {
            this.errorMessage =
              'User could not be found.';

            return;
          }


          this.errorMessage =
            'Could not change password. Please try again.';
        }

      });
  }
}