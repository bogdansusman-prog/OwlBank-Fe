import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
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
}
