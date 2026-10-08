import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface UserCard {
  firstName: string;
  lastName: string;
  lastFourDigitsCardNumber: string;
  cardId: string;
  isBlocked: boolean;
}


export interface UserDetails {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;

  dateOfBirth?: string;

  balance: number;
  cards: UserCard[];
}

export interface UpdateUserDetailsRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}


@Injectable({
  providedIn: 'root'
})
export class UserService {

resetPassword(
  email: string,
  password: string,
  newPassword: string,
  confirmPassword: string
): Observable<string> {

  const params = new HttpParams()
    .set('email', email)
    .set('password', password)
    .set('newPassword', newPassword)
    .set('confirmPassword', confirmPassword);

  return this.http.patch(
    '/api/resetpassword',
    null,
    {
      params,
      responseType: 'text'
    }
  );
}

updateUserDetails(
  request: UpdateUserDetailsRequest
): Observable<string> {

  return this.http.patch(
    '/api/users/user-details',
    request,
    {
      responseType: 'text'
    }
  );
}

  constructor(private http: HttpClient) {}


  getBalance(): Observable<number> {
    return this.http.get(
      '/api/users/balance',
      {
        responseType: 'text'
      }
    ).pipe(
      map(response => Number(response))
    );
  }


  getUserDetails(): Observable<UserDetails> {
    return this.http.get<UserDetails>(
      '/api/users/user-details'
    );
  }


  deposit(
    amount: number,
    description: string
  ): Observable<string> {

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
  ): Observable<string> {

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