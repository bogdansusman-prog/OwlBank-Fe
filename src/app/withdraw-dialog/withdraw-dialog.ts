import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import{
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../services/user';

@Component({
  selector: 'app-withdraw-dialog',
  imports:[
    FormsModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './withdraw-dialog.html',
  styleUrl: './withdraw-dialog.css'
})
export class WithdrawDialog {
  amount: number | null = null;
  description = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private dialogRef: MatDialogRef<WithdrawDialog>,
    private userService: UserService
  ){}

  withdraw():void {
    this.errorMessage = '';

    if(this.amount === null || this.amount <= 0){
        this.errorMessage = 'Please enter a valid amount.';
      return;
    }
    if(!this.description.trim()){
        this.errorMessage = 'Please enter a description.';
      return;
    }
    this.isLoading = true;

    this.userService.withdraw(
      this.amount,
      this.description.trim()
    ).subscribe({
      next:() => {
        this.isLoading = false;
        this.dialogRef.close(true);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;

        if(error.status === 401){
          this.errorMessage = 
          'Your session has expired. Please retry.'
          return;
        }
        this.errorMessage = 'Withdrawal failed. Please try again.'
      }
    });
  }
  cancel(): void{
    this.dialogRef.close(false);
    
  }
}
