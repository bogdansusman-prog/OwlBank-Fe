import {
  Component
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  MatDialogRef
} from '@angular/material/dialog';

import {
  MatIconModule
} from '@angular/material/icon';


@Component({
  selector:
    'app-reveal-card-dialog',

  standalone: true,

  imports: [
    FormsModule,
    MatIconModule
  ],

  templateUrl:
    './reveal-card-dialog.html',

  styleUrl:
    './reveal-card-dialog.css'
})
export class RevealCardDialog {

  password = '';

  showPassword = false;


  constructor(
    private dialogRef:
      MatDialogRef<RevealCardDialog>
  ) {}


  togglePasswordVisibility():
    void {

    this.showPassword =
      !this.showPassword;
  }


  cancel(): void {

    this.dialogRef.close(
      null
    );
  }


  confirm(): void {

    const password =
      this.password.trim();

    if (!password) {
      return;
    }

    this.dialogRef.close(
      password
    );
  }
}