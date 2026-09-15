import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CardResponse {
  id: string;
  firstName: string;
  expirationDate: string;
  cvv: string;
  cardNumber: string;
  userId: string;
  isBlocked: boolean;
  isActive: boolean;
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
}