import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(
    private http: HttpClient
  ) {}

  getTransactions():
    Observable<Transaction[]> {

    return this.http.get<Transaction[]>(
      '/api/users/transactions'
    );
  }
}