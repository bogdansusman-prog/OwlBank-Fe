import {
  Component,
  Inject
} from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@angular/material/dialog';

import {
  MatIconModule
} from '@angular/material/icon';


export interface DeleteCardDialogData {
  lastFourDigits: string;
}


@Component({
  selector: 'app-delete-card-dialog',

  standalone: true,

  imports: [
    MatIconModule
  ],

  templateUrl:
    './delete-card-dialog.html',

  styleUrl:
    './delete-card-dialog.css'
})
export class DeleteCardDialog {

  constructor(
    private dialogRef:
      MatDialogRef<DeleteCardDialog>,

    @Inject(MAT_DIALOG_DATA)
    public data:
      DeleteCardDialogData
  ) {}


  cancel(): void {
    this.dialogRef.close(false);
  }


  confirm(): void {
    this.dialogRef.close(true);
  }
}