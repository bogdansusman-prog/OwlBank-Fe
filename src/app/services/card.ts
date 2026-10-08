import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


export interface CardResponse {
  id: string;
  firstName: string;
  lastName: string;
  expirationDate: string;
  cvv: string;
  cardNumber: string;
  userId: string;
  isBlocked: boolean;
  isActive: boolean;
}

export interface CardBackDetails {
  cvv: string;
  expirationDate: string;
  cardNumber: string;
  isBlocked: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor(
    private http: HttpClient
  ) {}


  getAllCards():
    Observable<CardResponse[]> {

    return this.http.get<CardResponse[]>(
      '/api/users/get-all-cards'
    );
  }


  addCard():
    Observable<string> {

    return this.http.post(
      '/api/users/add-cards',
      null,
      {
        responseType: 'text'
      }
    );
  }


  deleteCard(
    cardId: string
  ): Observable<string> {

    return this.http.post(
      '/api/users/delete-cards',
      null,
      {
        params: {
          cardId: cardId
        },
        responseType: 'text'
      }
    );
  }

blockCard(
  cardId: string
): Observable<void> {

  return this.http.patch<void>(
    `/api/users/blocked-cards/${cardId}`,
    null
  );
}


activateCard(
  cardId: string
): Observable<void> {

  return this.http.patch<void>(
    `/api/users/activate-cards/${cardId}`,
    null
  );
}

getCardBackDetails(
  password: string,
  cardId: string
): Observable<CardBackDetails> {

  const params =
    new HttpParams()
      .set(
        'password',
        password
      )
      .set(
        'cardID',
        cardId
      );

  return this.http.get<CardBackDetails>(
    '/api/users/card-details-back',
    {
      params
    }
  );
}

}