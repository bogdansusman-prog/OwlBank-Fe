import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import { MatIconModule } from '@angular/material/icon';

import { DepositDialog } from '../deposit-dialog/deposit-dialog';
import { WithdrawDialog } from '../withdraw-dialog/withdraw-dialog';

@Component({
  selector: 'app-transfer',
  imports: [
    RouterLink,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './transfer.html',
  styleUrl: './transfer.css'
})
export class Transfer {

  depositSuccess = false;
  withdrawSuccess = false;

  constructor(
    private dialog: MatDialog
  ) {}

  openDeposit(): void {
    const dialogRef = this.dialog.open(
      DepositDialog,
      {
        panelClass: 'owlbank-dialog'
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.depositSuccess = true;
        this.withdrawSuccess = false;
      }
    });
  }

  openWithdraw(): void {
    const dialogRef = this.dialog.open(
      WithdrawDialog,
      {
        panelClass: 'owlbank-dialog'
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.withdrawSuccess = true;
        this.depositSuccess = false;
      }
    });
  }

  onButtonMouseMove(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    button.style.setProperty(
      '--mouse-x',
      `${mouseX}px`
    );

    button.style.setProperty(
      '--mouse-y',
      `${mouseY}px`
    );
  }
}