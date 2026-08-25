import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
  password: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<string> {
  const params = new HttpParams()
    .set('Email', email)
    .set('Password', password);

  return this.http.post('/api/login', null, {
    params,
    responseType: 'text'
  });
}

  register(data: RegisterRequest): Observable<string> {
  const params = new HttpParams()
    .set('Password', data.password)
    .set('ConfirmPassword', data.confirmPassword)
    .set('Email', data.email)
    .set('FirstName', data.firstName)
    .set('LastName', data.lastName)
    .set('PhoneNumber', data.phoneNumber)
    .set('DateOfBirth', data.dateOfBirth);

  return this.http.post('/api/register', null, {
    params,
    responseType: 'text'
  });
}

  resetPassword(data: ResetPasswordRequest): Observable<string> {
  const params = new HttpParams()
    .set('email', data.email)
    .set('password', data.password)
    .set('newPassword', data.newPassword)
    .set('confirmPassword', data.confirmPassword);

  return this.http.patch('/api/resetpassword', null, {
    params,
    responseType: 'text'
  });
}
}