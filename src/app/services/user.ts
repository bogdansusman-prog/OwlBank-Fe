import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'
import { map, Observable } from 'rxjs';

@Injectable({
    providedIn : 'root'
})
export class UserService{
    constructor(private http: HttpClient){}

    getBalance(): Observable<number>{
        return this.http.get('/api/users/balance', {
            responseType: 'text'
        }).pipe(
            map(response => Number(response))
        );
    }
    deposit(
        amount: number,
        description: string
    ): Observable<string>{
        const params = new HttpParams()
        .set('Amount', amount.toString())
        .set('Description', description);

        return this.http.post(
            '/api/users/deposit',
            null,
            {
                params,
                responseType: 'text'
            }
        );
    }
    withdraw(
        amount: number,
        description: string
    ): Observable<string>{
        const params = new HttpParams()
        .set('Amount', amount.toString())
        .set('Description', description);

        return this.http.post(
            '/api/users/withdraw',
            null,
            {
                params,
                responseType: 'text'
            }
        );
    }
    transferMoney(
  phoneNumber: string,
  amount: number
): Observable<string> {

  const params = new HttpParams()
    .set('amount', amount.toString());

  return this.http.post(
    `/api/users/transfer/${encodeURIComponent(phoneNumber)}`,
    null,
    {
      params,
      responseType: 'text'
    }
  );
}
}
