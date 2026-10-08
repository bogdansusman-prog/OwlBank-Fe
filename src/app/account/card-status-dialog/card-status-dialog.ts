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


export interface CardStatusDialogData {
  action:
    'block' | 'activate';

  lastFourDigits: string;
}


@Component({
  selector: 'app-card-status-dialog',

  standalone: true,

  imports: [
    MatIconModule
  ],

  templateUrl:
    './card-status-dialog.html',

  styleUrl:
    './card-status-dialog.css'
})
export class CardStatusDialog {

  constructor(
    private dialogRef:
      MatDialogRef<CardStatusDialog>,

    @Inject(MAT_DIALOG_DATA)
    public data:
      CardStatusDialogData
  ) {}


  get isBlock(): boolean {
    return this.data.action === 'block';
  }


  cancel(): void {
    this.dialogRef.close(false);
  }


  confirm(): void {
    this.dialogRef.close(true);
  }
}