import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID
} from '@angular/core';

import {
  AsyncPipe,
  isPlatformBrowser
} from '@angular/common';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  BehaviorSubject,
  interval,
  Subscription
} from 'rxjs';

import {
  UserService
} from '../services/user';

import {
  Transaction,
  TransactionService
} from '../services/transaction';


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
export class Home
  implements OnInit, OnDestroy {


  /* =========================================================
     BALANCE
  ========================================================= */

  balance =
    new BehaviorSubject<number>(0);

  isBalanceLoading =
    new BehaviorSubject<boolean>(true);

  balanceError = '';


  /* =========================================================
     TRANSACTIONS
  ========================================================= */

  transactions = new BehaviorSubject<Transaction[]>([]);

  isTransactionsLoading = true;

  transactionsError = '';


  /* =========================================================
     PROFILE
  ========================================================= */

  isProfileMenuOpen = false;


  /* =========================================================
     INTERNAL
  ========================================================= */

  private platformId =
    inject(PLATFORM_ID);

  private refreshSubscription:
    Subscription | null = null;


  /* =========================================================
     CONSTRUCTOR
  ========================================================= */

  constructor(
    private userService:
      UserService,

    private transactionService:
      TransactionService,

    private router:
      Router
  ) {}


  /* =========================================================
     INIT
  ========================================================= */

  ngOnInit(): void {

    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {
      return;
    }


    /*
      Prima încărcare.
    */

    this.loadBalance();

    this.loadTransactions();


    /*
      Refresh automat la fiecare 2 secunde.

      false = nu afișăm loading-ul de fiecare
      dată, ca să nu pâlpâie pagina.
    */

    this.refreshSubscription =
      interval(2000)
        .subscribe(() => {

          this.loadBalance(
            false
          );

          this.loadTransactions(
            false
          );

        });
  }


  /* =========================================================
     DESTROY
  ========================================================= */

  ngOnDestroy(): void {

    this.refreshSubscription
      ?.unsubscribe();
  }


  /* =========================================================
     BALANCE
  ========================================================= */

  loadBalance(
    showLoading = true
  ): void {

    if (showLoading) {

      this.isBalanceLoading.next(
        true
      );
    }


    this.balanceError = '';


    this.userService
      .getBalance()
      .subscribe({

        next: (
          balance: number
        ) => {

          this.balance.next(
            balance
          );

          this.isBalanceLoading.next(
            false
          );
        },


        error: (
          error:
            HttpErrorResponse
        ) => {

          this.isBalanceLoading.next(
            false
          );

          this.balanceError =
            'Could not load balance.';


          console.error(
            'Balance request failed:',
            error.status
          );
        }

      });
  }


  /* =========================================================
     TRANSACTIONS
  ========================================================= */

  loadTransactions(
    showLoading = true
  ): void {

    if (showLoading) {

      this.isTransactionsLoading =
        true;
    }


    this.transactionsError = '';


    this.transactionService
      .getTransactions()
      .subscribe({

        next: (
  transactions: Transaction[]
) => {

  this.transactions.next(
  [...transactions]
    .sort(
      (first, second) =>
        new Date(second.date).getTime() -
        new Date(first.date).getTime()
    )
);

  this.isTransactionsLoading = false;
},


        error: (
          error:
            HttpErrorResponse
        ) => {

          this.isTransactionsLoading =
            false;

          this.transactionsError =
            'Could not load transactions.';


          console.error(
            'Transactions request failed:',
            error.status
          );
        }

      });
  }


  /* =========================================================
     TRANSACTION DATE
  ========================================================= */

  formatTransactionDate(
    date: string
  ): string {

    const transactionDate =
      new Date(date);


    return new Intl.DateTimeFormat(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    ).format(
      transactionDate
    );
  }


  /* =========================================================
     PROFILE MENU
  ========================================================= */

  toggleProfileMenu(): void {

    this.isProfileMenuOpen =
      !this.isProfileMenuOpen;
  }


  signOut(): void {

    localStorage.removeItem(
      'token'
    );

    this.isProfileMenuOpen =
      false;

    this.router.navigate([
      '/login'
    ]);
  }
}