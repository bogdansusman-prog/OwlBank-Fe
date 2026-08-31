import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe } from '@angular/common';

import { UserService } from '../services/user';
import { BehaviorSubject } from 'rxjs';

interface HomeTransaction{
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  description: string;
  amount: number;
  date: string; 
}

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

  balance = new BehaviorSubject<number>(0);
  isBalanceLoading = new BehaviorSubject<boolean>(true);
  balanceError = '';

  transactions: HomeTransaction[] = [
  {
    id: '1',
    type: 'deposit',
    description: 'Salary',
    amount: 5000,
    date: '26 Aug 2026'
  },
  {
    id: '2',
    type: 'withdrawal',
    description: 'Shopping',
    amount: -250,
    date: '25 Aug 2026'
  },
  {
    id: '3',
    type: 'transfer',
    description: 'Transfer to 0722123456',
    amount: -500,
    date: '24 Aug 2026'
  },
  {
    id: '4',
    type: 'deposit',
    description: 'Freelance',
    amount: 1200,
    date: '23 Aug 2026'
  },
  {
    id: '5',
    type: 'withdrawal',
    description: 'ATM Withdrawal',
    amount: -100,
    date: '22 Aug 2026'
  },
  {
    id: '6',
    type: 'transfer',
    description: 'Transfer to 0744556677',
    amount: -350,
    date: '21 Aug 2026'
  },
  {
    id: '7',
    type: 'deposit',
    description: 'Refund',
    amount: 180,
    date: '20 Aug 2026'
  }
];

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
    this.balanceError = '';

    this.userService.getBalance().subscribe({
      next: (balance: number) => {
        this.balance.next(balance);
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

