import {
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


export interface StatementResponse {
  id: string;
  userId: string;
  timeStamp: string;
  receivedAmount?: number;
  spentAmount?: number;
  description: string;
  transferAmount: number;
  type: number;
}


@Injectable({
  providedIn: 'root'
})
export class StatementService {

  constructor(
    private http: HttpClient
  ) {}


  getStatement(
    startDate: string,
    endDate: string
  ): Observable<StatementResponse[]> {

    const params =
      new HttpParams()
        .set(
          'startDate',
          startDate
        )
        .set(
          'endDate',
          endDate
        );

    return this.http.get<
      StatementResponse[]
    >(
      '/api/users/statement',
      {
        params
      }
    );
  }
}
