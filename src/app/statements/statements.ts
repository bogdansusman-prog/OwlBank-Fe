import {
  ChangeDetectorRef,
  Component,
  OnInit,
  PLATFORM_ID,
  inject
} from '@angular/core';

import {
  isPlatformBrowser
} from '@angular/common';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  FormsModule
} from '@angular/forms';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  StatementResponse,
  StatementService
} from '../services/statement';

import {
  finalize,
  map
} from 'rxjs';


interface StatementTransaction {
  id: string;
  date: string;
  description: string;
  type:
    | 'deposit'
    | 'withdrawal'
    | 'transfer';
  amount: number;
}


@Component({
  selector: 'app-statements',

  imports: [
    RouterLink,
    FormsModule,
    MatIconModule
  ],

  templateUrl: './statements.html',
  styleUrl: './statements.css'
})
export class Statements
  implements OnInit {

  private platformId =
    inject(PLATFORM_ID);


  private today =
    new Date();


  fromDate =
    this.toDateInputValue(
      new Date(
        this.today.getFullYear(),
        this.today.getMonth(),
        1
      )
    );


  toDate =
    this.toDateInputValue(
      this.today
    );


  appliedFromDate =
    this.fromDate;


  appliedToDate =
    this.toDate;


  transactionType = 'all';

  statementError = '';

  isStatementLoading = false;

  isProfileMenuOpen = false;


  /*
    Endpoint-ul /users/statement
    nu returneaza soldurile perioadei.

    Le tinem null ca sa NU afisam
    date financiare inventate.
  */
  openingBalance:
    number | null = null;

  closingBalance:
    number | null = null;


  transactions:
    StatementTransaction[] = [];


  constructor(
    private router: Router,
    private statementService:
      StatementService,
    private cdr:
      ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {
      return;
    }

    this.generateStatement();
  }


  get periodTransactions():
    StatementTransaction[] {

    if (
      this.transactionType === 'all'
    ) {
      return this.transactions;
    }

    return this.transactions.filter(
      transaction =>
        transaction.type ===
        this.transactionType
    );
  }


  get moneyIn(): number {

    return this.transactions
      .filter(
        transaction =>
          transaction.amount > 0
      )
      .reduce(
        (
          total,
          transaction
        ) =>
          total +
          transaction.amount,
        0
      );
  }


  get moneyOut(): number {

    return Math.abs(
      this.transactions
        .filter(
          transaction =>
            transaction.amount < 0
        )
        .reduce(
          (
            total,
            transaction
          ) =>
            total +
            transaction.amount,
          0
        )
    );
  }


  generateStatement(): void {

    this.statementError = '';

    if (
      !this.fromDate ||
      !this.toDate
    ) {
      this.statementError =
        'Please select both dates.';

      return;
    }


    if (
      this.fromDate >
      this.toDate
    ) {
      this.statementError =
        'Start date cannot be after end date.';

      return;
    }


    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {
      return;
    }


    this.isStatementLoading = true;


    this.statementService
      .getStatement(
        this.fromDate,
        this.toDate
      )
      .pipe(

        map(
          (
            statement:
              StatementResponse[]
          ) =>
            statement.map(
              item =>
                this.mapTransaction(
                  item
                )
            )
        ),

        finalize(() => {

          this.isStatementLoading =
            false;

          this.cdr.detectChanges();
        })

      )
      .subscribe({

        next: (
          transactions:
            StatementTransaction[]
        ) => {

          this.transactions =
            transactions;

          this.appliedFromDate =
            this.fromDate;

          this.appliedToDate =
            this.toDate;

          this.openingBalance = null;
          this.closingBalance = null;

          this.cdr.detectChanges();
        },


        error: (error) => {

          console.error(
            'Statement request failed:',
            error
          );

          this.statementError =
            'Could not load statement.';

          this.transactions = [];

          this.openingBalance = null;
          this.closingBalance = null;

          this.cdr.detectChanges();
        }

      });
  }


  private mapTransaction(
    item: StatementResponse
  ): StatementTransaction {

    let type:
      StatementTransaction['type'];


    if (item.type === 0) {
      type = 'deposit';
    } else if (item.type === 2) {
      type = 'withdrawal';
    } else {
      type = 'transfer';
    }


    let amount = 0;


    if (
      typeof item.receivedAmount ===
        'number' &&
      item.receivedAmount !== 0
    ) {
      amount =
        Math.abs(
          item.receivedAmount
        );
    } else if (
      typeof item.spentAmount ===
        'number' &&
      item.spentAmount !== 0
    ) {
      amount =
        -Math.abs(
          item.spentAmount
        );
    } else {
      amount =
        item.transferAmount ?? 0;
    }


    return {
      id:
        item.id,

      date:
        item.timeStamp,

      description:
        item.description,

      type:
        type,

      amount:
        amount
    };
  }


  formatCurrency(
    amount: number
  ): string {

    return new Intl.NumberFormat(
      'en-US',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    ).format(amount);
  }


  formatDate(
    date: string
  ): string {

    const normalizedDate =
      date.includes('T')
        ? date
        : `${date}T00:00:00`;


    return new Intl.DateTimeFormat(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    ).format(
      new Date(
        normalizedDate
      )
    );
  }


  toggleProfileMenu(): void {

    this.isProfileMenuOpen =
      !this.isProfileMenuOpen;
  }


  signOut(): void {

    localStorage.removeItem(
      'token'
    );

    this.isProfileMenuOpen = false;

    this.router.navigate([
      '/login'
    ]);
  }


  private toDateInputValue(
    date: Date
  ): string {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(
        2,
        '0'
      );

    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        '0'
      );

    return (
      `${year}-${month}-${day}`
    );
  }
}
