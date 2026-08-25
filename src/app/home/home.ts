import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe } from '@angular/common';

import { UserService } from '../services/user';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    MatIconModule,
    AsyncPipe
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  balance = new BehaviorSubject(0);
  isBalanceLoading = new BehaviorSubject(true);
  balanceError = '';

  private platformId = inject(PLATFORM_ID);

  constructor(
    private userService: UserService
  ) {}

  ngOnInit(): void {
     if (isPlatformBrowser(this.platformId)) {
        console.log(this.isBalanceLoading);
    this.loadBalance();
     }
  }

  loadBalance(): void {
    this.balanceError = '';

    this.userService.getBalance().subscribe({
      next: (balance: number) => {
        this.balance.next(balance);
        console.log(this.balance);
        this.isBalanceLoading.next(false);
      },

      error: (error: HttpErrorResponse) => {
        this.isBalanceLoading.next(false);
        this.balanceError = 'Could not load balance.';

        console.error('Balance request failed:', error.status);
      }
    });
  }
}