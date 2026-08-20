import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';

import { UserService } from '../services/user';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    MatIconModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  balance = 0;
  isBalanceLoading = true;
  balanceError = '';

  private platformId = inject(PLATFORM_ID);

  constructor(
    private userService: UserService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadBalance();
    }
  }

  loadBalance(): void {
    this.isBalanceLoading = true;
    this.balanceError = '';

    this.userService.getBalance().subscribe({
      next: (balance: number) => {
        this.balance = balance;
        this.isBalanceLoading = false;
      },

      error: (error: HttpErrorResponse) => {
        this.isBalanceLoading = false;
        this.balanceError = 'Could not load balance.';

        console.error('Balance request failed:', error.status);
      }
    });
  }
}